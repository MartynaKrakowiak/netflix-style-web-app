import React, { useState }  from "react";
import ListItem from "../../components/ListItem";
import "../watchlist/rowWatchlist.scss"
const SearchItemRow = ({ arr,  onModalOpenChange  })=>{
    const itemsPerRow = 6;
    const rows = [];
    for (let i = 0; i < arr.length; i += itemsPerRow) {
      rows.push(arr.slice(i, i + itemsPerRow));
    }
    const [hoveredItemIndex, setHoveredItemIndex] = useState(null);
    const [hoverTimeout, setHoverTimeout] = useState(null);
    const handleMouseEnter = (index) => {
      clearTimeout(hoverTimeout); // Clear any existing hoverTimeout
      const newHoverTimeout = setTimeout(() => {
        setHoveredItemIndex(index);
      }, 800); // Set a new hoverTimeout
      setHoverTimeout(newHoverTimeout);
    };
  
    const handleMouseLeave = () => {
      clearTimeout(hoverTimeout); // Clear the hoverTimeout when leaving
      setHoverTimeout(null);
      setHoveredItemIndex(null);
    };
   
    return(
        <div className="rowWatchlist">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="rowWrapper">
            {row.map((item, i) => (
              <ListItem
                key={i}
                index={rowIndex * itemsPerRow + i + 1} 
                itemNumber={rowIndex * itemsPerRow + i + 1} 
                item={item}
                onModalOpenChange={onModalOpenChange}
                isHovered={rowIndex * itemsPerRow + i === hoveredItemIndex} 
                onMouseEnter={() => handleMouseEnter(rowIndex * itemsPerRow + i)}
                onMouseLeave={handleMouseLeave}
              />
            ))}
          </div>
        ))}
      </div>
    )
}

export default SearchItemRow;