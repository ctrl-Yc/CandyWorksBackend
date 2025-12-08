-- ============================================
-- Users テーブル RLS
-- ============================================
alter table users enable row level security;

create policy "Users can insert their own profile"
  on users for insert
  with check (user_id = auth.uid());

create policy "Users can update their own profile"
  on users for update
  using (user_id = auth.uid());

create policy "Users can view their own profile"
  on users for select
  using (user_id = auth.uid());

-- ============================================
-- User Skills テーブル RLS
-- ============================================
alter table user_skills enable row level security;

create policy "Users can view their own skills"
  on user_skills for select
  using (user_id = auth.uid());

create policy "Users cannot modify skills"
  on user_skills for all
  using (false)
  with check (false);

create policy "Admins and evaluators can manage user skills"
  on user_skills for all
  using (EXISTS (
    SELECT 1 FROM users
    WHERE users.user_id = auth.uid()
    AND users.role = ANY (ARRAY['admin','evaluator'])
  ))
  with check (EXISTS (
    SELECT 1 FROM users
    WHERE users.user_id = auth.uid()
    AND users.role = ANY (ARRAY['admin','evaluator'])
  ));

-- ============================================
-- Skills テーブル RLS
-- ============================================
alter table skills enable row level security;

create policy "Anyone can view skills"
  on skills for select
  using (true);

create policy "Admins can insert skills"
  on skills for insert
  with check (EXISTS (
    SELECT 1 FROM users WHERE users.user_id = auth.uid() AND users.role = 'admin'
  ));

create policy "Admins can update skills"
  on skills for update
  using (EXISTS (
    SELECT 1 FROM users WHERE users.user_id = auth.uid() AND users.role = 'admin'
  ));

create policy "Admins can delete skills"
  on skills for delete
  using (EXISTS (
    SELECT 1 FROM users WHERE users.user_id = auth.uid() AND users.role = 'admin'
  ));

-- ============================================
-- Skill Tags テーブル RLS
-- ============================================
alter table skill_tags enable row level security;

create policy "Anyone can view skill_tags"
  on skill_tags for select
  using (true);

create policy "Admins can modify skill_tags"
  on skill_tags for all
  using (EXISTS (
    SELECT 1 FROM users WHERE users.user_id = auth.uid() AND users.role = 'admin'
  ));

-- ============================================
-- Recipes テーブル RLS
-- ============================================
alter table recipes enable row level security;

create policy "Anyone can view recipes"
  on recipes for select
  using (true);

create policy "Admins can manage recipes"
  on recipes for all
  using (EXISTS (
    SELECT 1 FROM users WHERE users.user_id = auth.uid() AND users.role = 'admin'
  ));

-- ============================================
-- Recipe Steps テーブル RLS
-- ============================================
alter table recipe_steps enable row level security;

create policy "Anyone can view recipe steps"
  on recipe_steps for select
  using (true);

create policy "Admins can manage recipe steps"
  on recipe_steps for all
  using (EXISTS (
    SELECT 1 FROM users WHERE users.user_id = auth.uid() AND users.role = 'admin'
  ));

-- ============================================
-- Recipe Step Images テーブル RLS
-- ============================================
alter table recipe_step_images enable row level security;

create policy "Anyone can view step images"
  on recipe_step_images for select
  using (true);

create policy "Admins can manage step images"
  on recipe_step_images for all
  using (EXISTS (
    SELECT 1 FROM users WHERE users.user_id = auth.uid() AND users.role = 'admin'
  ));

-- ============================================
-- Recipe Skills テーブル RLS
-- ============================================
alter table recipe_skills enable row level security;

create policy "Anyone can view recipe skills"
  on recipe_skills for select
  using (true);

create policy "Admins can manage recipe skills"
  on recipe_skills for all
  using (EXISTS (
    SELECT 1 FROM users WHERE users.user_id = auth.uid() AND users.role = 'admin'
  ));

-- ============================================
-- Submissions テーブル RLS
-- ============================================
alter table submissions enable row level security;

create policy "Users can insert their own submissions"
  on submissions for insert
  with check (user_id = auth.uid());

create policy "Users can view their own submissions"
  on submissions for select
  using (user_id = auth.uid());

-- ============================================
-- Submission Step Images テーブル RLS
-- ============================================
alter table submission_step_images enable row level security;

create policy "Users can insert their own step images"
  on submission_step_images for insert
  with check (EXISTS (
    SELECT 1 FROM submissions
    WHERE submissions.submission_id = submission_step_images.submission_id
    AND submissions.user_id = auth.uid()
  ));

create policy "Users can view their own step images"
  on submission_step_images for select
  using (EXISTS (
    SELECT 1 FROM submissions
    WHERE submissions.submission_id = submission_step_images.submission_id
    AND submissions.user_id = auth.uid()
  ));

-- ============================================
-- Evaluations テーブル RLS
-- ============================================
alter table evaluations enable row level security;

create policy "Users can view their own evaluations"
  on evaluations for select
  using (EXISTS (
    SELECT 1 FROM submissions
    WHERE submissions.submission_id = evaluations.submission_id
    AND submissions.user_id = auth.uid()
  ));

create policy "Admins and evaluators can manage evaluations"
  on evaluations for all
  using (EXISTS (
    SELECT 1 FROM users
    WHERE users.user_id = auth.uid()
    AND users.role = ANY (ARRAY['admin','evaluator'])
  ));

-- ============================================
-- Skill Evaluations テーブル RLS
-- ============================================
alter table skill_evaluations enable row level security;

create policy "Users can view their own skill evaluations"
  on skill_evaluations for select
  using (user_id = auth.uid());

-- ============================================
-- Step Photos テーブル RLS
-- ============================================
alter table step_photos enable row level security;

-- ユーザーは自分の写真だけ閲覧可能
create policy "Users can view their own step photos"
  on step_photos for select
  using (user_id = auth.uid());

-- ユーザーは自分の写真だけ追加可能
create policy "Users can insert their own step photos"
  on step_photos for insert
  with check (user_id = auth.uid());

-- ユーザーは自分の写真だけ更新可能
create policy "Users can update their own step photos"
  on step_photos for update
  using (user_id = auth.uid());

-- ユーザーは自分の写真だけ削除可能
create policy "Users can delete their own step photos"
  on step_photos for delete
  using (user_id = auth.uid());