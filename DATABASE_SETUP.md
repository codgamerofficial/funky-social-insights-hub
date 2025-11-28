# Database Setup Instructions

## Important: Run SQL Schema in Supabase

Before testing the application, you **MUST** run the database schema in your Supabase project.

### Steps to Set Up the Database:

1. **Open Supabase SQL Editor**
   - Go to https://supabase.com/dashboard/project/ileywkgxavikqrjtpurt
   - Navigate to the **SQL Editor** in the left sidebar

2. **Run the Schema**
   - Open the file `supabase/schema.sql` in this project
   - Copy the entire contents of the file
   - Paste it into the Supabase SQL Editor
   - Click **Run** to execute the SQL

3. **Verify Tables Created**
   - Go to **Table Editor** in Supabase
   - You should see the following tables:
     - `profiles`
     - `social_accounts`
     - `analytics_data`
     - `ai_insights`
     - `reports`

4. **Verify RLS Policies**
   - Each table should have Row Level Security (RLS) enabled
   - Policies should be visible in the **Authentication > Policies** section

### What the Schema Creates:

- **profiles**: User profile information (auto-created on signup)
- **social_accounts**: Connected Instagram/Facebook accounts
- **analytics_data**: Historical analytics metrics
- **ai_insights**: AI-generated insights and recommendations
- **reports**: Generated reports and exports

All tables have:
- ✅ Row Level Security (RLS) enabled
- ✅ User-specific policies (users can only access their own data)
- ✅ Automatic triggers for profile creation and timestamps
- ✅ Indexes for performance optimization

### Testing the Application:

After running the schema:

1. **Sign Up** for a new account
2. **Sign In** with your credentials
3. Navigate to different pages:
   - **Dashboard**: Will show "No data" initially (expected)
   - **Analytics**: Will show empty state
   - **AI Insights**: Will show empty state
   - **Reports**: Will show empty state
   - **Profile**: Should display your user information

### Adding Sample Data (Optional):

To test with sample data, you can manually insert records in the Supabase Table Editor or run this SQL:

```sql
-- Insert sample analytics data (replace USER_ID with your actual user ID)
INSERT INTO analytics_data (user_id, date, followers_count, engagement_rate, reach, likes_count, comments_count)
VALUES 
  ('USER_ID', CURRENT_DATE, 1000, 5.5, 5000, 250, 50),
  ('USER_ID', CURRENT_DATE - INTERVAL '1 day', 950, 5.2, 4800, 240, 48);

-- Insert sample AI insight
INSERT INTO ai_insights (user_id, title, content, category, priority)
VALUES 
  ('USER_ID', 'Engagement Tip', 'Your posts perform best between 6-8 PM. Consider scheduling more content during these hours.', 'engagement', 'high');

-- Insert sample report
INSERT INTO reports (user_id, title, description, report_type, date_range_start, date_range_end)
VALUES 
  ('USER_ID', 'Weekly Performance Report', 'Analysis of your social media performance', 'weekly', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE);
```

Replace `USER_ID` with your actual user ID (you can find this in the `profiles` table after signing up).

## Troubleshooting:

- **Can't see data**: Make sure you're signed in and the user ID matches
- **Authentication errors**: Check that the Supabase URL and anon key are correct in `src/integrations/supabase/client.ts`
- **RLS errors**: Ensure all policies were created correctly by checking the Supabase dashboard

## Next Steps:

Once the database is set up, you can:
- Connect social media accounts (UI placeholder ready)
- View analytics data
- Generate reports
- Receive AI insights
