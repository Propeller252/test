(() => {
  // Простая модель: хранится локально в LocalStorage
  const STORAGE_KEY = "my_calendar_events";

  const state = {
    events: [], // [{ title, date: "YYYY-MM-DD", notes }]
  };

  const $year = document.getElementById("year");
  const $month = document.getElementById("month");
  const $days = document.getElementById("days");
  const $eventForm = document.getElementById("event-form");
  const $title = document.getElementById("title");
  const $date = document.getElementById("date");
  const $notes = document.getElementById("notes");

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.events));
  }

  function load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        state.events = JSON.parse(raw);
      } catch {
        state.events = [];
      }
    }
  }

  function renderYearMonth(year, month) {
    // populate year/month selects
    // года от текущего-5 до текущего+5
    const cur = new Date();
    const start = cur.getFullYear() - 5;
    const end = cur.getFullYear() + 5;
    $year.innerHTML = "";
    for (let y = start; y <= end; y++) {
      const opt = document.createElement("option");
      opt.value = y;
      opt.textContent = y;
      if (y === year) opt.selected = true;
      $year.appendChild(opt);
    }
    $month.innerHTML = "";
    const months = [
      "Январь","Февраль","Март","Апрель","Май","Июнь",
      "Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"
    ];
    for (let m = 0; m < 12; m++) {
      const opt = document.createElement("option");
      opt.value = m;
      opt.textContent = months[m];
      if (m === month) opt.selected = true;
      $month.appendChild(opt);
    }
  }

  function renderCalendar(year, month) {
    // первая конфигурация: сколько дней в предыдущем месяце/нужный сетку
    const firstDay = new Date(year, month, 1).getDay(); // Sunday=0
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // очистка
    $days.innerHTML = "";

    // Заголовок неделей (опционально можно добавить)
    // Заполнение пустых клеток для начала недели
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement("div");
      empty.className = "day";
      empty.style.visibility = "hidden";
      $days.appendChild(empty);
    }

    // даты месяца
    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement("div");
      cell.className = "day";
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const label = document.createElement("div");
      label.style.fontWeight = "bold";
      label.textContent = d;
      cell.appendChild(label);

      // события на дату
      const items = state.events.filter(e => e.date === dateStr);
      items.forEach(e => {
        const ev = document.createElement("div");
        ev.className = "event";
        ev.textContent = e.title;
        cell.appendChild(ev);
      });

      // кликом можно добавить быстро событие
      cell.addEventListener("click", () => {
        const t = prompt("Название события:");
        if (t) {
          const ne = { title: t, date: dateStr, notes: "" };
          state.events.push(ne);
          save();
          renderCalendar(year, month);
        }
      });

      $days.appendChild(cell);
    }
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(state.events, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "calendar.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function importJSON(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (Array.isArray(data)) {
          state.events = data;
          save();
          const y = parseInt($year.value, 10);
          const m = parseInt($month.value, 10);
          renderCalendar(y, m);
        } else {
          alert("Неправильный формат файла.");
        }
      } catch {
        alert("Не удалось импортировать файл.");
      }
    };
    reader.readAsText(file);
  }

  // загрузка и инициализация
  load();
  const now = new Date();
  renderYearMonth(now.getFullYear(), now.getMonth());
  renderCalendar(now.getFullYear(), now.getMonth());

  // обработчики
  $year.addEventListener("change", () => {
    renderCalendar(parseInt($year.value, 10), parseInt($month.value, 10));
  });
  $month.addEventListener("change", () => {
    renderCalendar(parseInt($year.value, 10), parseInt($month.value, 10));
  });

  $eventForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = $title.value.trim();
    const date = $date.value;
    const notes = $notes.value.trim();
    if (!title || !date) return;
    state.events.push({ title, date, notes });
    save();
    $title.value = "";
    $notes.value = "";
    renderCalendar(parseInt($year.value, 10), parseInt($month.value, 10));
  });

  document.getElementById("clear").addEventListener("click", () => {
    if (confirm("Упорядочить календарь и удалить все события?")) {
      state.events = [];
      save();
      renderCalendar(parseInt($year.value, 10), parseInt($month.value, 10));
    }
  });

  document.getElementById("export-btn").addEventListener("click", exportJSON);
  document.getElementById("import-btn").addEventListener("click", () => {
    const f = document.getElementById("import-input").files[0];
    if (f) importJSON(f);
  });
})();
