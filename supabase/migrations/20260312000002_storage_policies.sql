-- Storage policies for post-images bucket
create policy "Public can view post images"
  on storage.objects for select to public
  using (bucket_id = 'post-images');

create policy "Authenticated users can upload post images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own post images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
