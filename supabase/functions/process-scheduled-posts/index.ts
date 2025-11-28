/**
 * Process Scheduled Posts Edge Function
 * Runs periodically to publish scheduled posts to their respective platforms
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScheduledJob {
    id: string
    user_id: string
    video_id: string
    platforms: string[]
    scheduled_for: string
    status: string
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Initialize Supabase client
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Fetch due jobs
        const now = new Date().toISOString()
        const { data: jobs, error: fetchError } = await supabaseClient
            .from('scheduled_jobs')
            .select('*, videos(*)')
            .eq('status', 'scheduled')
            .lte('scheduled_for', now)
            .limit(10)

        if (fetchError) throw fetchError

        console.log(`Found ${jobs?.length || 0} due jobs`)

        const results = []

        // 2. Process each job
        for (const job of jobs || []) {
            try {
                console.log(`Processing job ${job.id} for video ${job.video_id}`)

                // Update status to processing
                await supabaseClient
                    .from('scheduled_jobs')
                    .update({ status: 'processing' })
                    .eq('id', job.id)

                // TODO: Implement actual platform publishing logic here
                // This would involve:
                // 1. Fetching platform credentials for the user
                // 2. Refreshing tokens if needed
                // 3. Calling the platform APIs (YouTube, Facebook, Instagram)
                // 4. Updating the platform_posts table with results

                // Simulate successful publishing
                await new Promise(resolve => setTimeout(resolve, 1000))

                // Update status to completed
                await supabaseClient
                    .from('scheduled_jobs')
                    .update({
                        status: 'completed',
                        executed_at: new Date().toISOString()
                    })
                    .eq('id', job.id)

                results.push({ id: job.id, status: 'success' })
            } catch (jobError) {
                console.error(`Error processing job ${job.id}:`, jobError)

                // Update status to failed
                await supabaseClient
                    .from('scheduled_jobs')
                    .update({
                        status: 'failed',
                        error_message: jobError.message
                    })
                    .eq('id', job.id)

                results.push({ id: job.id, status: 'failed', error: jobError.message })
            }
        }

        return new Response(
            JSON.stringify({ success: true, processed: results.length, results }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
