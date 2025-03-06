// frontend/src/components/Report/ReportButton.js
import ReportIcon from '@mui/icons-material/Report';
import { IconButton } from '@mui/material';

export default function ReportButton({ type, itemId, onReport }) {
  const handleClick = () => {
    if (window.confirm('Are you sure you want to report?')) {
      onReport(type, itemId);
    }
  };

  return (
    <IconButton color="error" onClick={handleClick}>
      <ReportIcon
        className="cursor-pointer text-gray-500 hover:text-red-600"
      />
    </IconButton>
  );
}