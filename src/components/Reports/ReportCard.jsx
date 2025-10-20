// components/Reports/ReportCard.jsx
export default function ReportCard({ report }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{report.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{report.description}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          report.status === 'completed' ? 'bg-green-100 text-green-800' :
          report.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {report.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div>
          <span className="text-gray-500">Generated:</span>
          <p className="font-medium">{report.generatedDate}</p>
        </div>
        <div>
          <span className="text-gray-500">Size:</span>
          <p className="font-medium">{report.size}</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <button className="btn-outline btn-sm">
            <EyeIcon className="w-4 h-4" />
            Preview
          </button>
          <button className="btn-outline btn-sm">
            <ShareIcon className="w-4 h-4" />
            Share
          </button>
        </div>
        
        <button className="btn-primary btn-sm">
          <DownloadIcon className="w-4 h-4 mr-2" />
          Download
        </button>
      </div>
    </div>
  );
}