const STORAGE_KEY = 'todo-app:items';

const state = {
  items: load(),
  filter: 'all',
};

const $list = document.getElementById('todo-list');
const $form = document.getElementById('add-form');
const $input = document.getElementById('new-todo');
const $footer = document.querySelector('.footer');
const $count = document.getElementById('count');
const $filters = document.querySelectorAll('.filter');
const $clear = document.getElementById('clear-completed');
const $empty = document.getElementById('empty');

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function render() {
  const filtered = state.items.filter((item) => {
    if (state.filter === 'active') return !item.done;
    if (state.filter === 'completed') return item.done;
    return true;
  });

  $list.innerHTML = '';
  for (const item of filtered) {
    const li = document.createElement('li');
    li.className = 'todo-item' + (item.done ? ' done' : '');
    li.dataset.id = item.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = item.done;
    checkbox.className = 'check';
    checkbox.setAttribute('aria-label', '完了切替');

    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = item.text;
    label.title = 'ダブルクリックで編集';

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'delete';
    delBtn.textContent = '×';
    delBtn.setAttribute('aria-label', '削除');

    li.append(checkbox, label, delBtn);
    $list.append(li);
  }

  const remaining = state.items.filter((i) => !i.done).length;
  $count.textContent = `残り ${remaining} 件`;
  $footer.hidden = state.items.length === 0;
  $empty.hidden = state.items.length !== 0;

  for (const btn of $filters) {
    btn.classList.toggle('active', btn.dataset.filter === state.filter);
  }
}

function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  state.items.push({ id: makeId(), text: trimmed, done: false });
  save();
  render();
}

function toggleTodo(id) {
  const item = state.items.find((i) => i.id === id);
  if (!item) return;
  item.done = !item.done;
  save();
  render();
}

function deleteTodo(id) {
  state.items = state.items.filter((i) => i.id !== id);
  save();
  render();
}

function editTodo(id, text) {
  const trimmed = text.trim();
  if (!trimmed) {
    deleteTodo(id);
    return;
  }
  const item = state.items.find((i) => i.id === id);
  if (!item) return;
  item.text = trimmed;
  save();
  render();
}

$form.addEventListener('submit', (e) => {
  e.preventDefault();
  addTodo($input.value);
  $input.value = '';
  $input.focus();
});

$list.addEventListener('click', (e) => {
  const li = e.target.closest('.todo-item');
  if (!li) return;
  const id = li.dataset.id;
  if (e.target.classList.contains('check')) {
    toggleTodo(id);
  } else if (e.target.classList.contains('delete')) {
    deleteTodo(id);
  }
});

$list.addEventListener('dblclick', (e) => {
  if (!e.target.classList.contains('label')) return;
  const li = e.target.closest('.todo-item');
  const id = li.dataset.id;
  const item = state.items.find((i) => i.id === id);
  if (!item) return;

  const input = document.createElement('input');
  input.type = 'text';
  input.value = item.text;
  input.className = 'edit';
  e.target.replaceWith(input);
  input.focus();
  input.select();

  let finished = false;
  const finish = (commit) => {
    if (finished) return;
    finished = true;
    if (commit) editTodo(id, input.value);
    else render();
  };

  input.addEventListener('blur', () => finish(true));
  input.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') finish(true);
    else if (ev.key === 'Escape') finish(false);
  });
});

for (const btn of $filters) {
  btn.addEventListener('click', () => {
    state.filter = btn.dataset.filter;
    render();
  });
}

$clear.addEventListener('click', () => {
  state.items = state.items.filter((i) => !i.done);
  save();
  render();
});

render();
