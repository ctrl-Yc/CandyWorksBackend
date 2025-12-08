-- ============================================
-- Users テーブル
-- ============================================
create table if not exists users (
  user_id uuid primary key default gen_random_uuid(),
  nickname text,
  avatar_url text,
  rank integer,
  role text not null default 'user',
  level_diagnosed boolean not null default false,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);

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
-- Skills テーブル
-- ============================================
create table if not exists skills (
  skill_id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  tags jsonb
);

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
-- User Skills テーブル
-- ============================================
create table if not exists user_skills (
  user_skill_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(user_id),
  skill_id uuid not null references skills(skill_id),
  level integer not null default 1,
  passed_count integer not null default 0,
  acquired_at timestamp not null default now(),
  updated_at timestamp not null default now()
);

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
    SELECT 1 FROM users WHERE users.user_id = auth.uid() AND users.role = ANY (ARRAY['admin','evaluator'])
  ))
  with check (EXISTS (
    SELECT 1 FROM users WHERE users.user_id = auth.uid() AND users.role = ANY (ARRAY['admin','evaluator'])
  ));

-- ============================================
-- Skill Tags テーブル
-- ============================================
create table if not exists skill_tags (
  skill_id uuid not null references skills(skill_id),
  tag text not null,
  primary key (skill_id, tag)
);

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
-- Recipes テーブル
-- ============================================
create table if not exists recipes (
  recipe_id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  difficulty integer not null,
  finish_url text
);

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
-- Recipe Steps テーブル
-- ============================================
create table if not exists recipe_steps (
  step_id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes(recipe_id),
  step_number integer not null,
  instruction text not null,
  skill_id uuid references skills(skill_id),
  requires_photo boolean not null default false,
  title text
);

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
-- Recipe Step Images テーブル
-- ============================================
create table if not exists recipe_step_images (
  image_id uuid primary key default gen_random_uuid(),
  step_id uuid not null references recipe_steps(step_id),
  image_url text not null,
  order_index integer default 1
);

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
-- Recipe Ingredients テーブル
-- ============================================
create table if not exists recipe_ingredients (
  ingredient_id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes(recipe_id),
  name text not null,
  quantity text,
  unit text,
  order_index integer,
  note text
);

-- ============================================
-- Recipe Skills テーブル
-- ============================================
create table if not exists recipe_skills (
  recipe_id uuid not null references recipes(recipe_id),
  skill_id uuid not null references skills(skill_id),
  primary key (recipe_id, skill_id)
);

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
-- Submissions テーブル
-- ============================================
create table if not exists submissions (
  submission_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(user_id),
  recipe_id uuid not null references recipes(recipe_id),
  image_urls text[],
  submitted_at timestamp not null default now(),
  status text not null,
  feedback text
);

alter table submissions enable row level security;

create policy "Users can insert their own submissions"
  on submissions for insert
  with check (user_id = auth.uid());

create policy "Users can view their own submissions"
  on submissions for select
  using (user_id = auth.uid());

-- ============================================
-- Submission Step Images テーブル
-- ============================================
create table if not exists submission_step_images (
  submission_step_image_id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(submission_id),
  step_id uuid not null references recipe_steps(step_id),
  image_url text not null
);

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
-- Step Photos テーブル
-- ============================================
create table if not exists step_photos (
  photo_id uuid primary key default gen_random_uuid(),
  step_id uuid not null references recipe_steps(step_id),
  user_id uuid not null references users(user_id),
  image_url text not null,
  uploaded_at timestamp not null default now()
);

-- ============================================
-- Evaluations テーブル
-- ============================================
create table if not exists evaluations (
  evaluation_id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(submission_id),
  user_id uuid not null references users(user_id),
  is_passed boolean not null,
  advice text,
  evaluated_at timestamp not null default now()
);

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
-- Skill Evaluations テーブル
-- ============================================
create table if not exists skill_evaluations (
  skill_evaluation_id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(submission_id),
  skill_id uuid not null references skills(skill_id),
  user_id uuid not null references users(user_id),
  is_passed boolean not null,
  evaluated_at timestamp not null default now()
);

alter table skill_evaluations enable row level security;

create policy "Users can view their own skill evaluations"
  on skill_evaluations for select
  using (user_id = auth.uid());