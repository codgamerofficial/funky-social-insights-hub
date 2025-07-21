import { ArrowLeft, FileText, Download, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";

const Reports = () => {
  const { toast } = useToast();

  const handleDownloadReport = (reportType: string) => {
    toast({
      title: "Report Generated",
      description: `Your ${reportType} report is being prepared for download.`,
    });
  };

  const reports = [
    {
      title: "Weekly Performance Report",
      description: "Comprehensive analysis of your social media performance over the past week",
      type: "weekly",
      gradient: "instagram"
    },
    {
      title: "Monthly Analytics Summary", 
      description: "Detailed monthly insights including growth metrics and engagement trends",
      type: "monthly",
      gradient: "facebook"
    },
    {
      title: "Custom Date Range Report",
      description: "Generate reports for any specific date range you choose",
      type: "custom",
      gradient: "funky"
    }
  ];

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
            Generate Detailed Reports
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Download comprehensive reports with insights, metrics, and recommendations 
            for your social media performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report, index) => (
            <Card key={index} className="glass-card p-6 btn-3d group text-center">
              <div className="space-y-4">
                <div className={`w-16 h-16 ${report.gradient} rounded-2xl flex items-center justify-center mx-auto animate-float`}>
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{report.title}</h3>
                <p className="text-muted-foreground text-sm">{report.description}</p>
                <Button 
                  className={`w-full ${report.gradient} text-white hover:opacity-90 btn-3d`}
                  onClick={() => handleDownloadReport(report.type)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </Card>
          ))}
        </div>

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