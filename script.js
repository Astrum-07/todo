
'use strict';

const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const list = document.getElementById('task-list');
const countTotal = document.getElementById('count-total');
const countDone = document.getElementById('count-done');

let tasks = []; 


const STORAGE_KEY = 'todo_tasks_v1';
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      tasks = parsed;
    }
  } catch (e) {
    console.error('LocalStorage read error', e);
  }
}


function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2,7);
}
function updateCounts() {
  countTotal.textContent = tasks.length;
  countDone.textContent = tasks.filter(t => t.done).length;
}


function render() {
  list.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task';
    li.dataset.id = task.id;


    const cb = document.createElement('button');
    cb.className = 'checkbox' + (task.done ? ' checked' : '');
    cb.setAttribute('aria-label', task.done ? 'Belgilangan' : 'Belgilash');
    cb.title = task.done ? 'Belgini olib tashlash' : 'Bajarildi deb belgilash';
    cb.type = 'button';

    const cbIcon = document.createElement('span');
    if (task.done) cbIcon.textContent = '✓';
    li.appendChild(cb);
    cb.appendChild(cbIcon);


    const textWrap = document.createElement('div');
    textWrap.className = 'task-text' + (task.done ? ' done' : '');
    textWrap.textContent = task.text;
    textWrap.title = task.text;

    li.appendChild(textWrap);


    const controls = document.createElement('div');
    controls.className = 'controls';


    const editBtn = document.createElement('button');
    editBtn.className = 'icon-btn';
    editBtn.innerHTML = '✎';
    editBtn.title = 'Tahrirlash';
    editBtn.type = 'button';


    const delBtn = document.createElement('button');
    delBtn.className = 'icon-btn';
    delBtn.innerHTML = '🗑';
    delBtn.title = 'O\'chirish';
    delBtn.type = 'button';

    controls.appendChild(editBtn);
    controls.appendChild(delBtn);
    li.appendChild(controls);


    list.appendChild(li);


    cb.addEventListener('click', () => {
      toggleDone(task.id);
    });

    delBtn.addEventListener('click', () => {
      if (confirm('Vazifani o\'chirmoqchimisiz?')) {
        removeTask(task.id);
      }
    });

    editBtn.addEventListener('click', () => {
      startEdit(task.id, textWrap, editBtn);
    });


    textWrap.addEventListener('dblclick', () => toggleDone(task.id));
  });

  updateCounts();
  saveTasks();
}


function addTask(text) {
  const t = {
    id: uid(),
    text: text.trim(),
    done: false
  };
  tasks.unshift(t);
  render();
}

function removeTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  render();
}

function toggleDone(id) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  t.done = !t.done;
  render();
}

function startEdit(id, textNode, editBtn) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;


  const input = document.createElement('input');
  input.className = 'edit-input';
  input.value = task.text;
  input.maxLength = 200;
  input.setAttribute('aria-label', 'Vazifani tahrirlash');


  const parent = textNode.parentElement;
  parent.replaceChild(input, textNode);
  input.focus();

  input.setSelectionRange(input.value.length, input.value.length);


  function acceptEdit() {
    const v = input.value.trim();
    if (!v) {
      if (confirm('Bo\'sh vazifa saqlansinmi? Bo\'sh bo\'lsa o\'chirilsinmi?')) {
        removeTask(id);
      } else {
        input.focus();
      }
      return;
    }
    task.text = v;
    render();
  }

  function cancelEdit() {
    render();
  }


  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') acceptEdit();
    if (e.key === 'Escape') cancelEdit();
  });


  input.addEventListener('blur', () => {
    acceptEdit();
  });
}


form.addEventListener('submit', (e) => {
  e.preventDefault();
  const val = input.value.trim();
  if (!val) {

    input.animate([{transform:'translateY(0)'},{transform:'translateY(-4px)'},{transform:'translateY(0)'}], {duration:220});
    return;
  }
  addTask(val);
  input.value = '';
  input.focus();
});


loadTasks();
render();
