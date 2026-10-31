/* Optional export libraries load only when a teacher requests an export. */
(() => {
  'use strict';
  let excelRequest;
  window.KNTLibraries = {
    excel() {
      if (window.ExcelJS?.Workbook) return Promise.resolve(window.ExcelJS);
      if (excelRequest) return excelRequest;
      excelRequest = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        const fail = () => { clearTimeout(timer); script.remove(); reject(new Error('โหลดเครื่องมือ Excel ไม่สำเร็จ กรุณาตรวจอินเทอร์เน็ตแล้วลองใหม่')); };
        const timer = setTimeout(fail, 20000);
        script.src = 'https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js';
        script.async = true;
        script.onload = () => {
          if (!window.ExcelJS?.Workbook) { fail(); return; }
          clearTimeout(timer); resolve(window.ExcelJS);
        };
        script.onerror = fail;
        document.head.appendChild(script);
      }).catch(error => { excelRequest = null; throw error; });
      return excelRequest;
    }
  };
})();
