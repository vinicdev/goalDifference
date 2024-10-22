let currentEditIndex = null;
let currentSubtractIndex = null;
let activeTooltip = null;

window.onload = function () {
  if (!localStorage.getItem("players")) {
    localStorage.setItem("players", JSON.stringify([]));
  }
  loadPlayers();
  setupEnterKeyActions();
};

function loadPlayers() {
  const players = JSON.parse(localStorage.getItem("players"));
  const playersList = document.getElementById("players");
  playersList.innerHTML = "";
  players.forEach((player, index) => {
    const li = document.createElement("li");
    li.textContent = player.name;

    const actionsDiv = document.createElement("div");
    actionsDiv.classList.add("actions");

    const dotsButton = document.createElement("button");
    dotsButton.innerHTML = "...";
    dotsButton.classList.add("dots-button");

    const tooltip = document.createElement("div");
    tooltip.classList.add("tooltip");

    const editButton = document.createElement("button");
    editButton.textContent = "Editar";
    editButton.onclick = function () {
      openEditModal(index);
      closeTooltip(tooltip);
    };

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Excluir";
    deleteButton.onclick = function () {
      deletePlayer(index);
      closeTooltip(tooltip);
    };

    tooltip.appendChild(editButton);
    tooltip.appendChild(deleteButton);
    actionsDiv.appendChild(dotsButton);
    actionsDiv.appendChild(tooltip);
    li.appendChild(actionsDiv);
    playersList.appendChild(li);

    dotsButton.onclick = function (event) {
      event.stopPropagation();
      if (activeTooltip && activeTooltip !== tooltip) {
        closeTooltip(activeTooltip);
      }
      activeTooltip = tooltip;
      tooltip.classList.toggle("show");
    };
  });

  const playersTable = document.getElementById("playersTable");
  playersTable.innerHTML = "";
  players.forEach((player, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${player.name} - Gols: ${player.goals}
      <div class="actions">
        <button class="add-goal-btn" onclick="addGoal(${index})">+ Gol</button>
        <button class="subtract-goal-btn" onclick="openSubtractModal(${index})">- Gol</button>
        <button class="dots-button">...</button>
        <div class="tooltip">
          <button class="edit-btn" onclick="openEditModal(${index})">Editar</button>
          <button class="delete-btn" onclick="deletePlayer(${index})">Excluir</button>
        </div>
      </div>
    `;
    playersTable.appendChild(li);

    const dotsButton = li.querySelector(".dots-button");
    const tooltip = li.querySelector(".tooltip");

    dotsButton.onclick = function (event) {
      event.stopPropagation();
      if (activeTooltip && activeTooltip !== tooltip) {
        closeTooltip(activeTooltip);
      }
      activeTooltip = tooltip;
      tooltip.classList.toggle("show");
    };
  });
}

function closeTooltip(tooltip) {
  tooltip.classList.remove("show");
  activeTooltip = null;
}

function addPlayer() {
  const playerName = document.getElementById("playerName").value.trim();
  if (playerName) {
    const players = JSON.parse(localStorage.getItem("players"));
    players.push({ name: playerName, goals: 0 });
    localStorage.setItem("players", JSON.stringify(players));
    document.getElementById("playerName").value = "";
    loadPlayers();
  }
}

function addGoal(index) {
  const players = JSON.parse(localStorage.getItem("players"));
  players[index].goals += 1;
  localStorage.setItem("players", JSON.stringify(players));
  loadPlayers();
}

function openSubtractModal(index) {
  currentSubtractIndex = index;
  document.getElementById("subtractModal").style.display = "block";
}

function closeSubtractModal() {
  document.getElementById("subtractModal").style.display = "none";
}

function confirmSubtractGoal() {
  subtractGoal(currentSubtractIndex);
  closeSubtractModal();
}

function subtractGoal(index) {
  const players = JSON.parse(localStorage.getItem("players"));
  if (players[index].goals > 0) {
    players[index].goals -= 1;
  }
  localStorage.setItem("players", JSON.stringify(players));
  loadPlayers();
}

function openEditModal(index) {
  currentEditIndex = index;
  const players = JSON.parse(localStorage.getItem("players"));
  document.getElementById("editPlayerName").value = players[index].name;
  document.getElementById("editModal").style.display = "block";
}

function closeEditModal() {
  document.getElementById("editModal").style.display = "none";
}

function updatePlayer() {
  const newName = document.getElementById("editPlayerName").value.trim();
  if (newName && newName !== "") {
    const players = JSON.parse(localStorage.getItem("players"));
    players[currentEditIndex].name = newName;
    localStorage.setItem("players", JSON.stringify(players));
    closeEditModal();
    loadPlayers();
  }
}

function deletePlayer(index) {
  const players = JSON.parse(localStorage.getItem("players"));
  players.splice(index, 1);
  localStorage.setItem("players", JSON.stringify(players));
  loadPlayers();
}

function showTableSection() {
  document.getElementById("addPlayersSection").style.display = "none";
  document.getElementById("tableSection").style.display = "block";
}

function showAddPlayersSection() {
  document.getElementById("tableSection").style.display = "none";
  document.getElementById("addPlayersSection").style.display = "block";
}

function openConfirmModal() {
  document.getElementById("confirmModal").style.display = "block";
}

function closeConfirmModal() {
  document.getElementById("confirmModal").style.display = "none";
}

function generatePDF() {
  const players = JSON.parse(localStorage.getItem("players"));

  const today = new Date();
  const formattedDate =
    String(today.getDate()).padStart(2, "0") +
    "/" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "/" +
    today.getFullYear();

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Relatório de Gols", doc.internal.pageSize.getWidth() / 2, 20, {
    align: "center",
  });
  doc.setFontSize(12);
  doc.text(`Data: ${formattedDate}`, doc.internal.pageSize.getWidth() / 2, 28, {
    align: "center",
  });

  doc.setFontSize(14);
  doc.text("Lista de Jogadores e Gols:", 10, 40);

  doc.setFontSize(12);
  let startY = 50;

  players.forEach((player, index) => {
    if (startY > 280) {
      doc.addPage();
      startY = 20;
    }
    doc.setFont(undefined, "bold");
    doc.text(`${index + 1}. ${player.name}`, 10, startY);
    doc.setFont(undefined, "normal");
    doc.text(`Gols: ${player.goals}`, 150, startY);
    startY += 10;
  });

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(
      `Página ${i} de ${totalPages}`,
      doc.internal.pageSize.getWidth() - 20,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  const fileName = `saldoGols-${formattedDate.replace(/\//g, "-")}.pdf`;
  doc.save(fileName);

  localStorage.setItem("players", JSON.stringify([]));
  loadPlayers();
  closeConfirmModal();
  showAddPlayersSection();
}

function setupEnterKeyActions() {
  const playerNameInput = document.getElementById("playerName");
  playerNameInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      addPlayer();
    }
  });

  const editPlayerNameInput = document.getElementById("editPlayerName");
  editPlayerNameInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      updatePlayer();
    }
  });
}

window.onclick = function (event) {
  const modal1 = document.getElementById("editModal");
  const modal2 = document.getElementById("confirmModal");
  const modal3 = document.getElementById("subtractModal");
  if (event.target === modal1) {
    closeEditModal();
  } else if (event.target === modal2) {
    closeConfirmModal();
  } else if (event.target === modal3) {
    closeSubtractModal();
  }

  if (activeTooltip && !event.target.closest(".tooltip")) {
    closeTooltip(activeTooltip);
  }
};
