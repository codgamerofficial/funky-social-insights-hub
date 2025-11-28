/**
 * Scheduler Page
 * Manage scheduled posts and content calendar
 */

import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { ContentCalendar } from '@/components/ContentCalendar';

const SchedulerPage = () => {
    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-6 py-8 space-y-8 max-w-7xl">
                <div className="flex items-center space-x-4">
                    <Link to="/">
                        <Button variant="ghost" className="btn-3d">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <h1 className="text-4xl font-bold text-gradient-funky">Advanced Content Scheduler</h1>
                </div>

                <ContentCalendar />
            </main>
        </div>
    );
};

export default SchedulerPage;
