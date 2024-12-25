-- meal_analyses テーブルの作成
create table meal_analyses (
  id uuid primary key,
  user_id uuid references auth.users,
  image_url text not null,
  analysis_results jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLSポリシーの設定（オプション）
alter table meal_analyses enable row level security;

create policy "Authenticated users can insert their own analyses"
  on meal_analyses for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own analyses"
  on meal_analyses for select
  using (auth.uid() = user_id);

-- Storage バケットの作成
INSERT INTO storage.buckets (id, name)
VALUES ('meal-images', 'meal-images');

-- バケットのポリシー設定
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'meal-images');

CREATE POLICY "Public Upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'meal-images');