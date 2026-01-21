import React, { useState } from 'react';
import YearFilter from './components/YearFilter';
import GamesGrid from './components/GamesGrid';
import Games3DContainer from './components/Games3DContainer';
import Accordion from './components/Accordion';
import { games } from './data';
import './App.css';

const App = () => {
  const [selectedYear, setSelectedYear] = useState("All");
  const [currentLayout, setCurrentLayout] = useState("flat");

  // Check if a specific year is selected (not "All")
  const is3DEnabled = selectedYear !== "All";

  const filteredGames = selectedYear === "All"
    ? games.slice().sort((a, b) => a.name.localeCompare(b.name))
    : games
      .filter(game => game.yearsPlayed.includes(selectedYear))
      .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="webapp">
      {/* Accordion Menu - positioned fixed in top-left */}
      <Accordion
        currentLayout={currentLayout}
        onLayoutChange={setCurrentLayout}
        disabled={!is3DEnabled}
      />

      <h1 style={{ textAlign: 'center' }}>THE GARDEN OF CHERRY</h1>
      <h3 style={{ textAlign: 'center' }}>
        A historical catalog of all the games streamed on
        <a href="https://twitch.tv/cherrius_" target="_blank" rel="noreferrer" style={{ color: '#9146FF' }}> Twitch</a> or
        <a href="https://youtube.com/cherrius" target="_blank" rel="noreferrer" style={{ color: '#FF0000' }}> Youtube</a>
      </h3>

      <div className="app">
        <YearFilter
          years={["All", ...[...new Set(games.flatMap(game => game.yearsPlayed))].sort((a, b) => a - b)]}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
        />

        {/* Show GamesGrid when "All" selected OR when FLAT layout is chosen, otherwise show 3D container */}
        {!is3DEnabled || currentLayout === 'flat' ? (
          <GamesGrid games={filteredGames} />
        ) : (
          <Games3DContainer
            games={filteredGames}
            currentLayout={currentLayout}
          />
        )}
      </div>
    </div>
  );
};

export default App;
