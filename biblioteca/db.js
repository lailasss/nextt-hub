import { supabase } from './supabase'

// ── AUTH ────────────────────────────────────────
export async function login(email, password) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('password', password)
    .single()
  if (error || !data) return null
  return data
}

export async function getUsers() {
  const { data } = await supabase.from('users').select('*').order('created_at')
  return data || []
}

export async function createUser(user) {
  const { data, error } = await supabase.from('users').insert([user]).select().single()
  if (error) throw error
  return data
}

export async function updateUser(id, updates) {
  const { data, error } = await supabase.from('users').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteUser(id) {
  await supabase.from('users').delete().eq('id', id)
}

// ── FLOWS ───────────────────────────────────────
export async function getFlows() {
  const { data: flows } = await supabase.from('flows').select('*, cards(*, comments(*))').order('created_at')
  return (flows || []).map(f => ({
    ...f,
    cards: (f.cards || []).map(c => ({
      ...c,
      desc: c.description,
      pri: c.priority,
      who: c.assigned_to,
      due: c.due_date,
      cmts: (c.comments || []).map(cm => ({ a: cm.author, t: cm.text, ts: new Date(cm.created_at).toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'}) }))
    }))
  }))
}

export async function createFlow(flow) {
  const { data, error } = await supabase.from('flows').insert([{ name: flow.name, color: flow.color, client: flow.client, cols: flow.cols }]).select().single()
  if (error) throw error
  return { ...data, cards: [] }
}

export async function updateFlow(id, updates) {
  await supabase.from('flows').update({ name: updates.name, color: updates.color, client: updates.client }).eq('id', id)
}

export async function deleteFlow(id) {
  await supabase.from('flows').delete().eq('id', id)
}

// ── CARDS ───────────────────────────────────────
export async function createCard(flowId, card) {
  const { data, error } = await supabase.from('cards').insert([{
    flow_id: flowId,
    title: card.title,
    description: card.desc,
    col: card.col,
    priority: card.pri,
    assigned_to: card.who,
    due_date: card.due,
    tags: card.tags || []
  }]).select().single()
  if (error) throw error
  return { ...data, desc: data.description, pri: data.priority, who: data.assigned_to, due: data.due_date, cmts: [] }
}

export async function updateCard(id, updates) {
  await supabase.from('cards').update({
    title: updates.title,
    description: updates.desc,
    col: updates.col,
    priority: updates.pri,
    assigned_to: updates.who,
    due_date: updates.due
  }).eq('id', id)
}

export async function deleteCard(id) {
  await supabase.from('cards').delete().eq('id', id)
}

export async function addComment(cardId, author, text) {
  const { data } = await supabase.from('comments').insert([{ card_id: cardId, author, text }]).select().single()
  return { a: data.author, t: data.text, ts: new Date(data.created_at).toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'}) }
}

// ── EVENTS ──────────────────────────────────────
export async function getEvents() {
  const { data } = await supabase.from('events').select('*').order('date')
  return (data || []).map(e => ({ ...e, clientIds: e.client_ids || [] }))
}

export async function createEvent(ev) {
  const { data } = await supabase.from('events').insert([{
    title: ev.title, date: ev.date, time: ev.time, color: ev.color,
    client_ids: ev.clientIds || [], is_client_event: ev.isClientEvent || false,
    owner_id: ev.ownerId
  }]).select().single()
  return { ...data, clientIds: data.client_ids || [] }
}

export async function updateEvent(id, updates) {
  await supabase.from('events').update({
    title: updates.title, date: updates.date, time: updates.time,
    color: updates.color, client_ids: updates.clientIds || []
  }).eq('id', id)
}

export async function deleteEvent(id) {
  await supabase.from('events').delete().eq('id', id)
}

// ── FILES ───────────────────────────────────────
export async function getFiles() {
  const { data } = await supabase.from('files').select('*').order('created_at', { ascending: false })
  return (data || []).map(f => ({ ...f, taggedIds: f.tagged_ids || [], fileData: f.file_data, fileType: f.file_type, clienteId: f.cliente_id }))
}

export async function createFile(file) {
  const { data } = await supabase.from('files').insert([{
    name: file.name, card_id: file.cardId, cliente_id: file.clienteId,
    size: file.size, priv: file.priv, tipo: file.tipo,
    url: file.url, file_data: file.fileData, file_type: file.fileType,
    tagged_ids: file.taggedIds || [], uploaded_by: file.by
  }]).select().single()
  return data
}

export async function deleteFile(id) {
  await supabase.from('files').delete().eq('id', id)
}

// ── CONTACTS ────────────────────────────────────
export async function getContacts() {
  const { data } = await supabase.from('contacts').select('*').order('name')
  return data || []
}

export async function createContact(ct) {
  const { data } = await supabase.from('contacts').insert([{
    name: ct.name, email: ct.email, phone: ct.phone,
    company: ct.company, tags: ct.tags || [], responsible: ct.resp
  }]).select().single()
  return data
}

export async function updateContact(id, ct) {
  await supabase.from('contacts').update({
    name: ct.name, email: ct.email, phone: ct.phone,
    company: ct.company, tags: ct.tags || []
  }).eq('id', id)
}

export async function deleteContact(id) {
  await supabase.from('contacts').delete().eq('id', id)
}

// ── GOALS ───────────────────────────────────────
export async function getGoals() {
  const { data } = await supabase.from('goals').select('*').order('created_at')
  return (data || []).map(g => ({ ...g, cur: g.current_value, target: g.target, dl: g.deadline, desc: g.description }))
}

export async function createGoal(g) {
  const { data } = await supabase.from('goals').insert([{
    title: g.title, description: g.desc, target: g.target,
    current_value: g.cur, unit: g.unit, color: g.color, deadline: g.dl
  }]).select().single()
  return { ...data, cur: data.current_value, dl: data.deadline, desc: data.description }
}

export async function updateGoal(id, cur) {
  await supabase.from('goals').update({ current_value: cur }).eq('id', id)
}

export async function deleteGoal(id) {
  await supabase.from('goals').delete().eq('id', id)
}

// ── FINANCES ────────────────────────────────────
export async function getFinances() {
  const { data } = await supabase.from('finances').select('*').order('created_at')
  return (data || []).map(f => ({ ...f, valor: f.value, vencimento: f.due_day, obs: f.notes, cliente: f.client_name }))
}

export async function createFinance(f) {
  const { data } = await supabase.from('finances').insert([{
    client_name: f.cliente, client_id: f.clientId, value: f.valor,
    due_day: f.vencimento, status: f.status, notes: f.obs
  }]).select().single()
  return { ...data, valor: data.value, vencimento: data.due_day, obs: data.notes, cliente: data.client_name }
}

export async function updateFinance(id, updates) {
  await supabase.from('finances').update({
    client_name: updates.cliente, value: updates.valor,
    due_day: updates.vencimento, status: updates.status, notes: updates.obs
  }).eq('id', id)
}

export async function deleteFinance(id) {
  await supabase.from('finances').delete().eq('id', id)
}

// ── CLIENT SPACES ────────────────────────────────
export async function getClientSpaces() {
  const { data } = await supabase.from('client_spaces').select('*').order('created_at')
  return (data || []).map(cs => ({ ...cs, logoUrl: cs.logo_url, projectId: cs.project_id, parceiro: cs.partner, cliente: cs.client_name, desc: cs.description }))
}

export async function createClientSpace(cs) {
  const { data } = await supabase.from('client_spaces').insert([{
    name: cs.name, logo_url: cs.logoUrl, color: cs.color,
    project_id: cs.projectId, partner: cs.parceiro,
    client_name: cs.cliente, description: cs.desc
  }]).select().single()
  return { ...data, logoUrl: data.logo_url, projectId: data.project_id, parceiro: data.partner, cliente: data.client_name, desc: data.description }
}

export async function updateClientSpace(id, cs) {
  await supabase.from('client_spaces').update({
    name: cs.name, logo_url: cs.logoUrl, color: cs.color,
    project_id: cs.projectId, partner: cs.parceiro,
    client_name: cs.cliente, description: cs.desc
  }).eq('id', id)
}

export async function deleteClientSpace(id) {
  await supabase.from('client_spaces').delete().eq('id', id)
}

// ── IDEAS ────────────────────────────────────────
export async function getIdeas(userId) {
  const { data } = await supabase.from('client_ideas').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  return data || []
}

export async function createIdea(userId, text) {
  const { data } = await supabase.from('client_ideas').insert([{ user_id: userId, text }]).select().single()
  return data
}

export async function toggleIdeaLike(id, liked) {
  await supabase.from('client_ideas').update({ liked }).eq('id', id)
}

export async function deleteIdea(id) {
  await supabase.from('client_ideas').delete().eq('id', id)
}

// ── CHAT ─────────────────────────────────────────
export async function getChat(userId) {
  const { data } = await supabase.from('client_chat').select('*').eq('user_id', userId).order('created_at')
  return (data || []).map(m => ({ ...m, from: m.from_role, name: m.sender_name, ts: new Date(m.created_at).toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'}), date: new Date(m.created_at).toLocaleDateString('pt-BR') }))
}

export async function sendChatMessage(userId, fromRole, senderName, text) {
  const { data } = await supabase.from('client_chat').insert([{ user_id: userId, from_role: fromRole, sender_name: senderName, text }]).select().single()
  return data
}

// ── NPS ──────────────────────────────────────────
export async function getNPS(userId) {
  const { data } = await supabase.from('nps').select('*').eq('user_id', userId).single()
  return data
}

export async function saveNPS(userId, score) {
  await supabase.from('nps').upsert([{ user_id: userId, score }], { onConflict: 'user_id' })
}

// ── SETTINGS ─────────────────────────────────────
export async function getSettings(key) {
  const { data } = await supabase.from('settings').select('value').eq('key', key).single()
  return data?.value
}

export async function saveSettings(key, value) {
  await supabase.from('settings').upsert([{ key, value }], { onConflict: 'key' })
}
