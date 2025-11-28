import { ArrowLeft, FileText, Download, Calendar, Loader2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { useReports } from "@/hooks/useReports";

const Reports = () => {
  const { data: reports, isLoading, error } = useReports();

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'weekly': return 'bg-blue-500/20 text-blue-500';
      case 'monthly': return 'bg-purple-500/20 text-purple-500';
      case 'custom': return 'bg-green-500/20 text-green-500';
      case 'export': return 'bg-orange-500/20 text-orange-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-6 py-8 space-y-8 max-w-7xl">
        <div className="flex items-center space-x-4">
          <Link to="/">
            <Button variant="ghost" className="btn-3d">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gradient-facebook">Reports</h1>
        </div>

        <div className="text-center space-y-4 py-8">
          <div className="w-16 h-16 gradient-funky rounded-2xl flex items-center justify-center mx-auto animate-float">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gradient-funky">
            Your Generated Reports
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Access and download your comprehensive social media performance reports.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : error || !reports || reports.length === 0 ? (
          <Card className="glass-card p-8 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-6">
              No reports generated yet. Start analyzing your data to create reports!
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <Card key={report.id} className="glass-card p-6 btn-3d">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 gradient-funky rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <Badge className={getReportTypeColor(report.report_type)}>
                      {report.report_type}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{report.title}</h3>
                    {report.description && (
                      <p className="text-sm text-muted-foreground mb-2">{report.description}</p>
                    )}
                    {report.date_range_start && report.date_range_end && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(report.date_range_start).toLocaleDateString()} - {new Date(report.date_range_end).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{new Date(report.created_at).toLocaleDateString()}</span>
                  </div>
                  <Button className="w-full gradient-instagram text-white hover:opacity-90 btn-3d">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center py-8">
          <div className="glass-card p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-gradient-instagram mb-4">
              Schedule Automated Reports
            </h3>
            <p className="text-muted-foreground mb-6">
              Set up automated report delivery to your email on a weekly or monthly basis.
            </p>
            <Button variant="instagram" size="lg" className="btn-3d">
              <Calendar className="w-4 h-4 mr-2" />
              Setup Automated Reports
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reports;