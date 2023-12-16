import React from "react";
import "./recommendedContent.scss";

const RecommendedContent = () =>{
    return(
        <div className="recommendedContent">
            <img src="https://news.harvard.edu/wp-content/uploads/2019/03/1_joXyuVebBLogVvVBSFk76A-1200x800.jpg" alt="" />
            <div className="details">
            <span className="similarity">80% Match</span>
                <div className="detailsTop">  
                    <span className="limit">16+</span>
                    <span className="age">2010</span>
                </div>
                <div className="recDescription">
                    After implementing the content recommendation engine, you will see a suggestion for a similar movie here. Work in progress.
                </div>
            </div>
        </div>
    )
}
export default RecommendedContent;
