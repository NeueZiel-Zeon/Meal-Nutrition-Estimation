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