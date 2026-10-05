// Intel Sustainability Summit Check-In Application

// Application constants
const maxGoal = 50;
const storageKey = 'intel_sustainability_summit_checkins';

// Application state
let totalAttendees = 0;
let waterCount = 0;
let zeroCount = 0;
let powerCount = 0;
let attendees = [];

// DOM Elements
const checkInForm = document.getElementById('checkInForm');
const attendeeNameInput = document.getElementById('attendeeName');
const teamSelect = document.getElementById('teamSelect');
const attendeeCountSpan = document.getElementById('attendeeCount');
const progressBar = document.getElementById('progressBar');
const greetingElement = document.getElementById('greeting');
const waterCountSpan = document.getElementById('waterCount');
const zeroCountSpan = document.getElementById('zeroCount');
const powerCountSpan = document.getElementById('powerCount');
const celebrationBanner = document.getElementById('celebrationBanner');
const winningTeamMessage = document.getElementById('winningTeamMessage');
const attendeeList = document.getElementById('attendeeList');
const attendeeListCount = document.getElementById('attendeeListCount');
const resetDataBtn = document.getElementById('resetDataBtn');

// Team display information mapping
const teamInfo = {
  water: {
    name: 'Team Water Wise',
    icon: '🌊',
    cssClass: 'water'
  },
  zero: {
    name: 'Team Net Zero',
    icon: '🌿',
    cssClass: 'zero'
  },
  power: {
    name: 'Team Renewables',
    icon: '⚡',
    cssClass: 'power'
  }
};

// Save current progress to browser localStorage
function saveProgress() {
  const data = {
    totalAttendees: totalAttendees,
    waterCount: waterCount,
    zeroCount: zeroCount,
    powerCount: powerCount,
    attendees: attendees
  };
  localStorage.setItem(storageKey, JSON.stringify(data));
}

// Load saved progress from browser localStorage
function loadProgress() {
  const savedData = localStorage.getItem(storageKey);
  if (savedData) {
    try {
      const parsedData = JSON.parse(savedData);
      totalAttendees = parsedData.totalAttendees || 0;
      waterCount = parsedData.waterCount || 0;
      zeroCount = parsedData.zeroCount || 0;
      powerCount = parsedData.powerCount || 0;
      attendees = parsedData.attendees || [];
    } catch (e) {
      console.warn('Could not parse saved check-in data from localStorage');
    }
  }
  updateUI();
}

// Find winning team name and stats
function getWinningTeamInfo() {
  const teams = [
    { key: 'water', name: 'Team Water Wise', count: waterCount },
    { key: 'zero', name: 'Team Net Zero', count: zeroCount },
    { key: 'power', name: 'Team Renewables', count: powerCount }
  ];

  // Find max count
  let highestCount = -1;
  for (let i = 0; i < teams.length; i = i + 1) {
    if (teams[i].count > highestCount) {
      highestCount = teams[i].count;
    }
  }

  // Find teams with highest count
  const leaders = [];
  for (let j = 0; j < teams.length; j = j + 1) {
    if (teams[j].count === highestCount) {
      leaders.push(teams[j]);
    }
  }

  if (highestCount === 0) {
    return 'No team has checked in yet!';
  }

  if (leaders.length === 1) {
    return `🏆 Winning Team: ${leaders[0].name} with ${leaders[0].count} attendees!`;
  } else if (leaders.length === 2) {
    return `🤝 Tied for 1st Place: ${leaders[0].name} and ${leaders[1].name} with ${highestCount} attendees each!`;
  } else {
    return `🤝 Three-Way Tie: All teams have ${highestCount} attendees each!`;
  }
}

// Render the list of checked-in attendees
function renderAttendeeList() {
  attendeeListCount.textContent = attendees.length;

  if (attendees.length === 0) {
    attendeeList.innerHTML = '<p class="empty-state">No attendees checked in yet. Check in above to get started!</p>';
    return;
  }

  let htmlContent = '';
  // Show recent attendees first
  for (let i = attendees.length - 1; i >= 0; i = i - 1) {
    const attendee = attendees[i];
    const team = teamInfo[attendee.team] || {
      name: attendee.team,
      icon: '👥',
      cssClass: 'water'
    };

    htmlContent = htmlContent + `
      <div class="attendee-item">
        <div class="attendee-info">
          <div class="attendee-avatar">
            <i class="fas fa-user"></i>
          </div>
          <span class="attendee-item-name">${attendee.name}</span>
        </div>
        <span class="attendee-badge ${team.cssClass}">
          ${team.icon} ${team.name}
        </span>
      </div>
    `;
  }

  attendeeList.innerHTML = htmlContent;
}

// Update all UI elements based on current state
function updateUI() {
  // Update attendance counter
  attendeeCountSpan.textContent = totalAttendees;

  // Update progress bar
  const progressPercentage = Math.min((totalAttendees / maxGoal) * 100, 100);
  progressBar.style.width = `${progressPercentage}%`;

  // Update team counters
  waterCountSpan.textContent = waterCount;
  zeroCountSpan.textContent = zeroCount;
  powerCountSpan.textContent = powerCount;

  // Render attendee list
  renderAttendeeList();

  // Check celebration condition (goal reached)
  if (totalAttendees >= maxGoal) {
    const winningMessage = getWinningTeamInfo();
    winningTeamMessage.textContent = winningMessage;
    celebrationBanner.style.display = 'block';
  } else {
    celebrationBanner.style.display = 'none';
  }
}

// Form submit event handler
checkInForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const name = attendeeNameInput.value.trim();
  const selectedTeam = teamSelect.value;

  if (!name || !selectedTeam) {
    return;
  }

  // Increment total attendance
  totalAttendees = totalAttendees + 1;

  // Increment specific team counter
  if (selectedTeam === 'water') {
    waterCount = waterCount + 1;
  } else if (selectedTeam === 'zero') {
    zeroCount = zeroCount + 1;
  } else if (selectedTeam === 'power') {
    powerCount = powerCount + 1;
  }

  // Add attendee to array
  const newAttendee = {
    name: name,
    team: selectedTeam,
    timestamp: new Date().toLocaleTimeString()
  };
  attendees.push(newAttendee);

  // Save updated progress to localStorage
  saveProgress();

  // Update page UI
  updateUI();

  // Display personalized greeting message
  const currentTeamInfo = teamInfo[selectedTeam] || { name: selectedTeam };
  greetingElement.textContent = `Welcome, ${name} to ${currentTeamInfo.name}! Thank you for checking in.`;
  greetingElement.className = 'success-message';
  greetingElement.style.display = 'block';

  // Clear form fields
  checkInForm.reset();
  attendeeNameInput.focus();
});

// Reset data handler
resetDataBtn.addEventListener('click', function () {
  const confirmed = confirm('Are you sure you want to reset all attendance and check-in data?');
  if (confirmed) {
    totalAttendees = 0;
    waterCount = 0;
    zeroCount = 0;
    powerCount = 0;
    attendees = [];

    localStorage.removeItem(storageKey);

    greetingElement.style.display = 'none';
    greetingElement.textContent = '';

    updateUI();
  }
});

// Initialize on page load
loadProgress();
