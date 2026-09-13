/* Bounded requests; reads can share an in-flight request. Writes are never retried. */
(function (global) {
  'use strict';
  const pending = new Map();
  let active = 0;
  function status() { global.dispatchEvent(new CustomEvent('knt-network', {detail:{active}})); }
  async function execute(url, options) {
    const {timeoutMs = 15000, mutation = false, ...init} = options;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    active++; status();
    try {
      const response = await fetch(url, {...init, signal:controller.signal});
      if (!response.ok) throw new Error(`เชื่อมต่อไม่สำเร็จ (${response.status})`);
      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') throw new Error(mutation ? 'ยังยืนยันการบันทึกไม่ได้ กรุณาตรวจข้อมูลบนระบบก่อนส่งซ้ำ' : 'ระบบตอบช้าเกินไป กรุณาลองโหลดใหม่');
      if (error instanceof TypeError) throw new Error(mutation ? 'การเชื่อมต่อขาดหาย ยังยืนยันการบันทึกไม่ได้ กรุณาตรวจระบบก่อนส่งซ้ำ' : 'เชื่อมต่อไม่ได้ ตรวจอินเทอร์เน็ตแล้วลองโหลดใหม่');
      throw error;
    } finally { clearTimeout(timer); active--; status(); }
  }
  function json(url, options = {}) {
    const canShare = !options.mutation && (!options.method || options.method === 'GET');
    const key = String(url);
    if (!canShare) return execute(url, options);
    if (!pending.has(key)) pending.set(key, execute(url, options).finally(() => pending.delete(key)));
    return pending.get(key);
  }
  global.KNTNetwork = {json};
})(window);
