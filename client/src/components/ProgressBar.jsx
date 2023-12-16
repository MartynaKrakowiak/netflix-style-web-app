import React from "react";
import './progressBar.scss';
const ProgressBar = ({progress})=>{
    return(
        <div className="progressContainer">
                <div className="progressBar" style={{ width: `${progress}%` }}>
            </div>
        </div>
    )
}

export default ProgressBar;