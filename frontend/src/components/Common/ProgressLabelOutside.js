// /frontend/src/components/Common/ProgressLabelOutside.js

import { Progress, Typography } from "@material-tailwind/react";
import PropTypes from "prop-types";

export function ProgressLabelOutside({ label, percentage }) {
  return (
    <div className="w-full mb-4">
      <div className="mb-2 flex items-center justify-between gap-4">
        <Typography color="blue-gray" variant="h6">
          {label}
        </Typography>
        <Typography color="blue-gray" variant="h6">
          {percentage}%
        </Typography>
      </div>
      <Progress value={percentage} />
    </div>
  );
}

ProgressLabelOutside.propTypes = {
  label: PropTypes.string.isRequired,
  percentage: PropTypes.number.isRequired,
};
