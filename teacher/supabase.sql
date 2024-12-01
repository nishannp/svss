-- First, create the teachers table (if not exists)
create table if not exists public.teachers (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    email text unique not null,
    department text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for teachers table
alter table public.teachers enable row level security;

-- Create policy for teachers table
create policy "Teachers are viewable by everyone"
on public.teachers for select
to public
using (true);

-- Now create the reviews table with proper foreign key
create table if not exists public.teacher_reviews (
    id uuid default gen_random_uuid() primary key,
    user_name text not null,
    review_text text not null,
    rating integer not null check (rating >= 1 and rating <= 5),
    user_image_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    teacher_id uuid not null references public.teachers(id) on delete cascade,
    user_id uuid references auth.users(id) default auth.uid()
);

-- Enable RLS for reviews table
alter table public.teacher_reviews enable row level security;

-- Policies for teacher_reviews table
-- Allow anyone to read reviews
create policy "Reviews are viewable by everyone"
on public.teacher_reviews for select
to public
using (true);

-- Allow authenticated users to create reviews
create policy "Users can create reviews"
on public.teacher_reviews for insert
to authenticated
with check (
    auth.role() = 'authenticated' and
    user_id = auth.uid()
);

-- Allow users to update their own reviews
create policy "Users can update their own reviews"
on public.teacher_reviews for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Allow users to delete their own reviews
create policy "Users can delete their own reviews"
on public.teacher_reviews for delete
to authenticated
using (user_id = auth.uid());

-- Storage setup for review images
-- First, check if bucket exists and create if it doesn't
do $$
begin
    insert into storage.buckets (id, name, public)
    values ('teacher_review_images', 'teacher_review_images', true)
    on conflict (id) do nothing;
end $$;

-- Storage policies
-- Policy for viewing images (public access)
create policy "Review images are publicly accessible"
on storage.objects for select
to public
using (
    bucket_id = 'teacher_review_images'
);

-- Policy for uploading images (authenticated users only)
create policy "Users can upload review images"
on storage.objects for insert
to authenticated
with check (
    bucket_id = 'teacher_review_images' and
    auth.role() = 'authenticated'
);

-- Policy for deleting images (only own images)
create policy "Users can delete own review images"
on storage.objects for delete
to authenticated
using (
    bucket_id = 'teacher_review_images' and
    auth.uid() = owner
);

-- Create indexes for better performance
create index if not exists teacher_reviews_teacher_id_idx 
on public.teacher_reviews(teacher_id);

create index if not exists teacher_reviews_created_at_idx 
on public.teacher_reviews(created_at desc);

-- Functions for common operations
-- Function to get all reviews for a teacher
create or replace function get_teacher_reviews(teacher_uuid uuid)
returns setof public.teacher_reviews
language sql
security definer
as $$
    select *
    from public.teacher_reviews
    where teacher_id = teacher_uuid
    order by created_at desc;
$$;

-- Function to get average rating for a teacher
create or replace function get_teacher_average_rating(teacher_uuid uuid)
returns float
language sql
security definer
as $$
    select coalesce(avg(rating)::float, 0)
    from public.teacher_reviews
    where teacher_id = teacher_uuid;
$$;

-- Update the frontend JavaScript code to match new storage bucket name