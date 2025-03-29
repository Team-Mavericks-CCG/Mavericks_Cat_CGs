
/* styling html and pionts to the model  */ 

/* on the call of on click of solitaire go here  */

import React, { useEffect, useState } from 'react';
import './styles.css';

// Constants for card dimensions and number of tableau columns
const CARD_WIDTH = 80;
const CARD_HEIGHT = 120;
const TABLEAU_COLUMNS = 7;


const generateTableau = () => {
    const tableau = [];
    for (let i = 0; i < TABLEAU_COLUMNS; i++) {
      const column = [];
      for (let j = 0; j <= i; j++) {
        // Each card gets a unique ID based on its column and row
        column.push({ id: `${i}-${j}` });
      }
      tableau.push(column);
    }
    return tableau;
  };

const SolitairePage: React.FC = () => {
    // Create the tableau columns when component renders
    const tableau = generateTableau();

    
  




export default solitairePage;


