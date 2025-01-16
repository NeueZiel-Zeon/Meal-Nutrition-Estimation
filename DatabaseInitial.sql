create table meal_analyses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  detected_dishes text[],
  food_items text[],
  calories numeric,
  portions jsonb,
  nutrients jsonb,
  deficient_nutrients text[],
  excessive_nutrients text[],
  improvements text[],
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLSポリシーの設定
alter table meal_analyses enable row level security;

create policy "Users can view their own analyses"
  on meal_analyses for select
  using (auth.uid() = user_id);

create policy "Users can insert their own analyses"
  on meal_analyses for insert
  with check (auth.uid() = user_id);

-- RLSポリシーの設定
create policy "Anyone can view meal images"
  on storage.objects for select
  using ( bucket_id = 'meal-images' );

create policy "Authenticated users can upload meal images"
  on storage.objects for insert
  with check (
    bucket_id = 'meal-images' 
    and auth.role() = 'authenticated'
  );

create policy "Users can update their own images"
  on storage.objects for update
  using ( bucket_id = 'meal-images' and auth.uid() = owner );

create policy "Users can delete their own images"
  on storage.objects for delete
  using ( bucket_id = 'meal-images' and auth.uid() = owner );

-- チャット履歴テーブル
create table chat_histories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  analysis_id uuid references meal_analyses(id),
  message_count int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
);

-- chat_historiesのRLSポリシー
alter table chat_histories enable row level security;

create policy "Users can view their own chat histories"
  on chat_histories for select
  using (auth.uid() = user_id);

create policy "Users can insert their own chat histories"
  on chat_histories for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own chat histories"
  on chat_histories for update
  using (auth.uid() = user_id);

-- メッセージテーブル
create table chat_messages (
  id uuid default uuid_generate_v4() primary key,
  chat_history_id uuid references chat_histories(id),
  role text check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- chat_messagesのRLSポリシー
alter table chat_messages enable row level security;

create policy "Users can view chat messages"
  on chat_messages for select
  using (
    chat_history_id in (
      select id from chat_histories
      where user_id = auth.uid()
    )
  );

create policy "Users can insert chat messages"
  on chat_messages for insert
  with check (
    chat_history_id in (
      select id from chat_histories
      where user_id = auth.uid()
    )
  );

-- データベースのタイムゾーンをJSTに設定
ALTER DATABASE postgres SET timezone TO 'Asia/Tokyo';

-- 既存のテーブルの列定義を更新
ALTER TABLE chat_histories 
  ALTER COLUMN created_at SET DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Tokyo'),
  ALTER COLUMN updated_at SET DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Tokyo');

-- chat_messagesテーブルの列定義を更新
ALTER TABLE chat_messages
  ALTER COLUMN created_at SET DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Tokyo');

CREATE OR REPLACE FUNCTION increment_count(row_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE chat_histories
  SET message_count = message_count + 1
  WHERE id = row_id;
END;
$$ LANGUAGE plpgsql;

-- 既存のchat_historiesテーブルに一意制約を追加
ALTER TABLE chat_histories
  ADD CONSTRAINT chat_histories_analysis_id_user_id_key 
  UNIQUE (analysis_id, user_id);