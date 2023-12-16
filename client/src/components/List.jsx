import React, { useRef, useState, useEffect } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import "./list.scss";
import ListItem from "./ListItem";

const List = ({ list, onModalOpenChange }) => {
  const ITEM_COUNT = 4;
  const listItemRef = useRef();
  const [sliderClickCounter, setSliderClickCounter] = useState(0);
  const [isSliderClicked, setIsSliderClicked] = useState(false);

  function handleSliderClick(direction) {
    // Set the slider as clicked
    setIsSliderClicked(true);
  
    const itemWidth = 1788;
    // Calculate the new counter value based on the direction (left or right)
    const newCounter =
      direction === "left"
        ? (sliderClickCounter - 1 + ITEM_COUNT) % ITEM_COUNT
        : (sliderClickCounter + 1) % ITEM_COUNT;
  
    // Update the slider click counter
    setSliderClickCounter(newCounter);
  
    // Calculate the new distance to shift the slider and update the style
    const distance = -newCounter * itemWidth;
    listItemRef.current.style.transform = `translateX(${distance}px)`;
  }
  
  const [hoveredItemIndex, setHoveredItemIndex] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  
  const handleMouseEnter = (index) => {
    const newHoverTimeout = setTimeout(() => {
      setHoveredItemIndex(index);
    }, 800); // Set a new hoverTimeout
    setHoverTimeout(newHoverTimeout);
  };
  
  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout); // Clear the hoverTimeout when leaving
      setHoverTimeout(null);
    }
    setHoveredItemIndex(null);
  };

  const [isSliderHovered, setIsSliderHovered] = useState(false);

  const handleSliderMouseEnter = () => {
    setIsSliderHovered(true);
  };

  const handleSliderMouseLeave = () => {
    setIsSliderHovered(false);
  };

  return (
    <div className="list">
      <span className="listTitle">{list.title}</span>

      <div className="slides">
        {isSliderHovered && (Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rectangle"
            style={{
              backgroundColor: index === sliderClickCounter ? "#cacaca" : "gray",
            }}
          ></div>
        )))}
      </div>
      <div className="listWrapper" >
        <CaretLeft
          className="sliderArrow left"
          onClick={() => handleSliderClick("left")}
          style={{ display: !isSliderClicked && "none" }}
          onMouseEnter={handleSliderMouseEnter} onMouseLeave={handleSliderMouseLeave}
        />
        <div className="listItemWrapper" ref={listItemRef}>
          {list.content.map((item, i) => (
            <ListItem
              index={i}
              type={list.type}
              itemNumber={i + 1}
              item={item._id}
              onModalOpenChange={onModalOpenChange}
              isHovered={i === hoveredItemIndex} // Pass true if this item is hovered, otherwise false
              onMouseEnter={() => handleMouseEnter(i)}
              onMouseLeave={handleMouseLeave}
            />
          ))}
        </div>
        <CaretRight
          className="sliderArrow right"
          onMouseEnter={handleSliderMouseEnter} onMouseLeave={handleSliderMouseLeave}
          onClick={() => handleSliderClick("right")
        }
        />
      </div>
    </div>
  );
};

export default List;
