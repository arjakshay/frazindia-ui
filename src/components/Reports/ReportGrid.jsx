// components/Reports/ReportGrid.jsx
import { useDownloadReport } from '../../hooks/useReports';
import ReportCard from './ReportCard';
import EmptyState from '../UI/EmptyState';

export default function ReportGrid({ reports }) {
  const downloadMutation = useDownloadReport();

  const handleDownload = async (reportId) => {
    try {
      await downloadMutation.mutateAsync(reportId);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  if (!reports || reports.length === 0) {
    return (
      <EmptyState
        title="No reports found"
        description="Try adjusting your filters or generate a new report."
        icon="file"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {reports.map((report) => (
        <ReportCard
          key={report.id}
          report={report}
          onDownload={handleDownload}
          isDownloading={downloadMutation.isLoading && downloadMutation.variables === report.id}
        />
      ))}
    </div>
  );
}