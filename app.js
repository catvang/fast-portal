(async function initFastPortalApp() {
  'use strict';

  // 1. Xóa phần tử cũ nếu tồn tại
  const oldRoot = document.getElementById('fast-automation-root');
  if (oldRoot) oldRoot.remove();
  const oldIframe = document.getElementById('fast-automation-worker-iframe');
  if (oldIframe) oldIframe.remove();

  // Định nghĩa URL CDN cho HTML template (thay đổi theo repository của bạn nếu cần)
  const CDN_HTML_URL = 'https://cdn.jsdelivr.net/gh/catvang/fast-portal@main/panel.html';

  // 2. Tải template HTML từ CDN và chèn vào DOM
  try {
    const res = await fetch(CDN_HTML_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const htmlTemplate = await res.text();

    const root = document.createElement('div');
    root.id = 'fast-automation-root';
    root.innerHTML = htmlTemplate;
    document.body.appendChild(root);
  } catch (err) {
    console.error("Lỗi nạp panel.html từ CDN:", err);
    alert("Không tải được file panel.html từ CDN. Kiểm tra lại đường dẫn GitHub/CDN!");
    return;
  }

  // 3. Khai báo hằng số và cấu hình báo cáo
  const BASE_PATH = '/FastBusinessOnline/Main/';
  const DEFAULT_BTN_SEARCH = '#ctl00_FastBusiness_MainReport_ToolbarButton_Search';
  const DEFAULT_BTN_OK = '#ctl00_FastBusiness_MainReport_searchExtender_updateDlgOk';
  const DIALOG_MSG_OK = '#ctl00_FastBusiness_MainReport_DialogMessage_dlgOk';

  function updateBrowserTabTitle(taskShortName, periodLabel, dvcs) {
    const branchPart = dvcs ? ` - ${dvcs.trim()}` : '';
    const newTitle = `${taskShortName} (${periodLabel})${branchPart}`;
    try {
      if (window.top && window.top.document) {
        window.top.document.title = newTitle;
      }
    } catch (e) {}
    document.title = newTitle;
  }

  const TASK_GROUPS = [
    {
      groupCode: 'A',
      groupName: 'Tính toán & Kết chuyển',
      items: [
        { code: 'tp', name: 'Tính toán phân bổ CCDC', shortName: 'Ttpb-Ccdc', path: 'tstinhpb.aspx?id=22.15.03', inputType: 'EXECUTE_TINH_PB', inputs: { thang: '[id*="formCell_1.2"], [id*="form_ky"]', nam: '[id*="formCell_1.3"], [id*="form_nam"]', maDvcs: '[id*="formCell_6.6"], [id*="ma_dvcs"]' } },
        { code: 'lp', name: 'Lập bút toán phân bổ CCDC', shortName: 'Btpb-Ccdc', path: 'tspb.aspx?id=22.15.09', inputType: 'EXECUTE_LAP_BT', inputs: { tuThang: '[id*="formCell_1.2"], [id*="tu_thang"]', denThang: '[id*="formCell_2.2"], [id*="den_thang"]', nam: '[id*="formCell_3.2"], [id*="nam"]', maDvcs: '[id*="formCell_5.5"], [id*="ma_dvcs"]' } },
        { code: 'tk', name: 'Tính toán khấu hao TSCĐ', shortName: 'Ttkh-Tscd', path: 'fatinhkh.aspx?id=18.70.32', inputType: 'EXECUTE_TINH_KH', inputs: { thang: '[id*="formCell_1.1"], [id*="form_ky"]', nam: '[id*="formCell_2.2"], [id*="form_nam"]', maDvcs: '[id*="formCell_3.6"], [id*="ma_dvcs"]' } },
        { code: 'lk', name: 'Lập bút toán khấu hao TSCĐ', shortName: 'Btkh-Tscd', path: 'fabtpb.aspx?id=18.70.38', inputType: 'EXECUTE_LAP_BT', inputs: { tuThang: '[id*="formCell_1.2"], [id*="tu_thang"]', denThang: '[id*="formCell_2.1"], [id*="den_thang"]', nam: '[id*="formCell_3.1"], [id*="nam"]', maDvcs: '[id*="formCell_5.6"], [id*="ma_dvcs"]' } },
        { code: 'gtb', name: 'Tính giá trung bình', shortName: 'Giatb', path: 'ingiatb.aspx?id=15.10.42', inputType: 'EXECUTE_GIA_TRUNG_BINH', inputs: { tuThang: '[id*="formCell_1.2"], [id*="tu_thang"]', denThang: '[id*="formCell_2.2"], [id*="den_thang"]', nam: '[id*="formCell_3.2"], [id*="nam"]', maDvcs: '[id*="formCell_5.3"], [id*="ma_dvcs"]' } },
        { code: 'gth', name: 'Tính giá thành tổng hợp', shortName: 'Gtth', path: 'cotinhgtth.aspx?id=16.70.71', inputType: 'EXECUTE_GIA_THANH', inputs: { thang: '[id*="formCell_1.2"], [id*="form_ky"]', nam: '[id*="formCell_1.3"], [id*="form_nam"]', maDvcs: '[id*="formCell_2.4"], [id*="ma_dvcs"]' } },
        { code: 'kc', name: 'Chạy bút toán kết chuyển', shortName: 'Btkc', path: 'glctkc.aspx?id=03.10.45', inputType: 'EXECUTE_KET_CHUYEN', inputs: { tuThang: '[id*="formCell_1.2"], [id*="tu_thang"]', denThang: '[id*="formCell_2.2"], [id*="den_thang"]', nam: '[id*="formCell_3.2"], [id*="nam"]', maDvcs: '[id*="formCell_4.6"], [id*="ma_dvcs"]' } }
      ]
    },
    {
      groupCode: 'B',
      groupName: 'Kế toán tổng hợp & BCTC',
      items: [
        { code: 'cdkt', name: 'Bảng cân đối kế toán (BCTC Năm)', shortName: 'Cdkt-Nam', path: 'rpt_gltc1.aspx?id=03.30.13', inputType: 'DATE_COMPARISON', inputs: { kyNayDen: '[id*="ngay2"], [id*="den_ngay"]', kyTruocDen: '[id*="ngay_truoc"], [id*="ky_truoc_den"]', loaiBaoCao: '[id*="form_form"], [id*="loai_bc"]', maDvcs: '#ctl00_FastBusiness_MainReport_searchExtender_form_ma_dvcs, [id$="ma_dvcs"], [name*="ma_dvcs"]' } },
        { code: 'nkc', name: 'Sổ nhật ký chung', shortName: 'Nkc', path: 'rpt_glbk1.aspx?id=03.20.91', inputType: 'DATE', filterPanelInput: '#ctl00_FastBusiness_MainReport_FilterPanelTextps_no', filterPanelValue: '<>0', inputs: { tuNgay: '[id*="tu_ngay"]', denNgay: '[id*="den_ngay"]', maDvcs: '#ctl00_FastBusiness_MainReport_searchExtender_form_ma_dvcs, [id$="ma_dvcs"], [name*="ma_dvcs"]' } },
        { code: 'cd', name: 'Cân đối phát sinh tài khoản', shortName: 'Cđpstk', path: 'rpt_glcd1d.aspx?id=03.30.11', inputType: 'DATE', inputs: { tuNgay: '[id*="ngay1"], [id*="tu_ngay"]', denNgay: '[id*="ngay2"], [id*="den_ngay"]', maDvcs: '#ctl00_FastBusiness_MainReport_searchExtender_form_ma_dvcs, [id$="ma_dvcs"], [name*="ma_dvcs"]' } },
        { code: 'kq', name: 'Kết quả SXKD', shortName: 'Kqkd', path: 'rpt_gltc2.aspx?id=03.30.14', inputType: 'DATE_COMPARISON', inputs: { kyNayTu: '[id*="ky_nay_tu"], [id*="tu_ngay"]', kyNayDen: '[id*="ky_nay_den"], [id*="den_ngay"]', kyTruocTu: '[id*="ky_truoc_tu"]', kyTruocDen: '[id*="ky_truoc_den"]', loaiBaoCao: '[id*="form_form"], [id*="loai_bc"]', maDvcs: '#ctl00_FastBusiness_MainReport_searchExtender_form_ma_dvcs, [id$="ma_dvcs"], [name*="ma_dvcs"]' } },
        { code: 'cp', name: 'Tổng hợp chi phí theo mã phí', shortName: 'Thcp-Mp', path: 'rpt_glbccp1ky.aspx?id=03.50.21', inputType: 'DATE_MULTI_CELL', inputs: { tuNgay: '[id*="formCell_1.4"], [id*="tu_ngay"]', denNgay: '[id*="formCell_1.5"], [id*="den_ngay"]', tkList: '[id*="formCell_2.6"]', bcTheo: '[id*="bc_theo"]', maDvcs: '#ctl00_FastBusiness_MainReport_searchExtender_form_ma_dvcs, [id$="ma_dvcs"], [name*="ma_dvcs"]' } }
      ]
    },
    {
      groupCode: 'C',
      groupName: 'Kho & Tồn kho',
      items: [
        { code: 'nxt', name: 'Nhập xuất tồn theo kho', shortName: 'Nxt', path: 'rpt_incd2.aspx?id=15.30.83', inputType: 'DATE', inputs: { tuNgay: '[id*="tu_ngay"]', denNgay: '[id*="den_ngay"]', maDvcs: '#ctl00_FastBusiness_MainReport_searchExtender_form_ma_dvcs, [id$="ma_dvcs"]' } },
        { code: 'vb', name: 'Tồn kho vỏ bình theo vị trí', shortName: 'Tkvb-Vt', path: 'zcbcthnxttvtrvb.aspx?id=38.40.02', inputType: 'DATE', inputs: { tuNgay: '[id*="tu_ngay"]', denNgay: '[id*="den_ngay"]', maDvcs: '#ctl00_FastBusiness_MainReport_searchExtender_form_ma_dvcs, [id$="ma_dvcs"]' } },
        { code: 'nxtk', name: 'NXT kho theo tài khoản', shortName: 'Nxt-Tk', path: 'rpt_incd1.aspx?id=15.30.82', inputType: 'DATE', inputs: { tuNgay: '[id*="formCell_1.3"], [id*="tu_ngay"]', denNgay: '[id*="formCell_1.4"], [id*="den_ngay"]', maDvcs: '[id*="formCell_4.5"], [id*="ma_dvcs"]' } }
      ]
    },
    {
      groupCode: 'D',
      groupName: 'Hóa đơn & Bán hàng',
      items: [
        { code: 'bh', name: 'Bán hàng theo vụ việc', shortName: 'Bh-Vv', path: 'rpt_soth2.aspx?id=11.30.34', inputType: 'DATE', inputs: { tuNgay: '[id*="ngay_ct1"], [id*="tu_ngay"]', denNgay: '[id*="ngay_ct2"], [id*="den_ngay"]', nhomTheo: '[id*="nh_theo"]', maDvcs: '#ctl00_FastBusiness_MainReport_searchExtender_form_ma_dvcs, [id$="ma_dvcs"]' } },
        { code: 'mv', name: 'Bảng kê mua vào', shortName: 'Bkmv', path: 'rpt_glthue1.aspx?id=03.39.11', inputType: 'MONTH_SINGLE_YEAR', inputs: { tuThang: '[id*="formCell_1.2"], [id*="form_ky1"], [id*="tu_thang"]', denThang: '[id*="formCell_2.2"], [id*="form_ky2"], [id*="den_thang"]', nam: '[id*="formCell_3.2"], [id*="form_nam"]', maDvcs: '[id*="formCell_11.2"], [id*="formCell_11.3"], [id*="form_ma_dvcs"], [id$="ma_dvcs"]', nhomHdr: '[id*="formCell_14.2"]', chonTt: '[id*="chon_tt"]' } },
        { code: 'br', name: 'Bảng kê bán ra', shortName: 'Bkbr', path: 'rpt_glthue2a.aspx?id=03.39.13', inputType: 'MONTH_SINGLE_YEAR', inputs: { tuThang: '[id*="formCell_1.2"], [id*="form_ky1"], [id*="tu_thang"]', denThang: '[id*="formCell_2.2"], [id*="form_ky2"], [id*="den_thang"]', nam: '[id*="formCell_3.2"], [id*="form_nam"]', maDvcs: '[id*="formCell_7.2"], [id*="formCell_8.2"], [id*="form_ma_dvcs"], [id$="ma_dvcs"]', nhomHdr: '[id*="formCell_10.2"]', chonTt: '[id*="chon_tt"]' } },
        { code: 'tk3', name: 'Tờ khai thuế GTGT', shortName: 'Tkgtgt', path: 'rpt_glthue3.aspx?id=03.39.19', inputType: 'MONTH_SINGLE_YEAR', inputs: { tuThang: '[id*="form_ky1"]', denThang: '[id*="form_ky2"]', nam: '[id*="form_nam"]', maDvcs: '#ctl00_FastBusiness_MainReport_searchExtender_form_ma_dvcs, [id$="ma_dvcs"]', chonTt: '[id*="chon_tt"]', loaiBaoCao: '[id*="form_form"]' } }
      ]
    },
    {
      groupCode: 'E',
      groupName: 'Tài sản & Công nợ',
      items: [
        { code: 'kh', name: 'Bảng khấu hao TSCĐ', shortName: 'Bkh-Tscd', path: 'rpt_fabckh.aspx?id=18.70.81', inputType: 'MONTH_DUAL_YEAR', inputs: { tuThang: '[id*="formCell_1.2"]', tuNam: '[id*="tu_nam"]', denThang: '[id*="formCell_2.2"]', denNam: '[id*="formCell_2.3"]', maDvcs: '#ctl00_FastBusiness_MainReport_searchExtender_form_ma_dvcs, [id$="ma_dvcs"]' } },
        { code: 'cc', name: 'Bảng tính chi phí CCDC', shortName: 'Btcp-Ccdc', path: 'rpt_btcpccdc.aspx?id=22.40.02', inputType: 'MONTH_DUAL_YEAR', inputs: { tuThang: '[id*="formCell_1.2"]', tuNam: '[id*="tu_nam"]', denThang: '[id*="formCell_2.2"]', denNam: '[id*="formCell_2.3"]', maDvcs: '#ctl00_FastBusiness_MainReport_searchExtender_form_ma_dvcs, [id$="ma_dvcs"]' } },
        { code: 'cn', name: 'Cân đối phát sinh công nợ', shortName: 'Cdcn', path: 'rpt_arcd2.aspx?id=07.30.16', inputType: 'DATE', inputs: { tuNgay: '[id*="tu_ngay"]', denNgay: '[id*="den_ngay"]', maDvcs: '#ctl00_FastBusiness_MainReport_searchExtender_form_ma_dvcs, [id$="ma_dvcs"]' } },
        {
          code: 'htt',
          name: 'Bảng kê công nợ của các HĐ theo hạn thanh toán',
          shortName: 'Bkcn-Htt',
          path: 'rpt_arttbk3.aspx?id=07.30.46',
          inputType: 'DATE_HAN_TT',
          inputs: {
            tinhDenNgay: '#ctl00_FastBusiness_MainReport_searchExtender0_formCell_1_1, [id*="searchExtender0_formCell_1.1"], [id*="formCell_1.1"]',
            ngayTinhHtt: '#ctl00_FastBusiness_MainReport_searchExtender0_formCell_2_1, [id*="searchExtender0_formCell_2.1"], [id*="formCell_2.1"]',
            maDvcs: '#ctl00_FastBusiness_MainReport_searchExtender_form_ma_dvcs, [id$="ma_dvcs"]'
          }
        }
      ]
    }
  ];

  const ALL_TASKS = TASK_GROUPS.flatMap(g => g.items);

  const pad = (n) => String(n).padStart(2, '0');
  const formatDate = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function isValidDateStr(str) {
    if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) return false;
    const parts = str.split('/');
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const y = parseInt(parts[2], 10);
    if (m < 1 || m > 12 || d < 1 || d > 31) return false;
    const testDate = new Date(y, m - 1, d);
    return testDate.getDate() === d && testDate.getMonth() === m - 1;
  }

  function resolveReportTimeRange(rawPeriodString, fromStartOfYear = false) {
    const fromInput = document.getElementById('fa-from-date-input');
    const toInput = document.getElementById('fa-to-date-input');
    const fVal = fromInput ? fromInput.value.trim() : '';
    const tVal = toInput ? toInput.value.trim() : '';

    if (isValidDateStr(fVal) && isValidDateStr(tVal)) {
      const fParts = fVal.split('/');
      const tParts = tVal.split('/');
      const fM = parseInt(fParts[1], 10);
      const fY = parseInt(fParts[2], 10);
      const tM = parseInt(tParts[1], 10);
      const tY = parseInt(tParts[2], 10);

      let finalFromDate = fVal;
      if (fromStartOfYear) {
        finalFromDate = `01/01/${tY}`;
      }

      return {
        labelKy: `${fVal.replace(/\//g, '')}-${tVal.replace(/\//g, '')}`,
        tuNgay: finalFromDate,
        denNgay: tVal,
        kyTruocTu: `01/01/${tY - 1}`,
        kyTruocDen: `31/12/${tY - 1}`,
        tuThang: String(fM),
        denThang: String(tM),
        nam: String(tY)
      };
    }
    return parsePeriodString(rawPeriodString, fromStartOfYear);
  }

  function parsePeriodString(rawInput, fromStartOfYear = false) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const s = (rawInput || '').trim().toUpperCase();

    let p = null;
    if (!s) {
      p = parseMonthPeriod(currentMonth, currentYear);
    } else if (/^\d{4}$/.test(s) || /^NAM[_ ]?(\d{4})$/.test(s)) {
      const y = parseInt(s.match(/\d{4}/)[0], 10);
      p = {
        labelKy: `Nam${y}`,
        tuNgay: `01/01/${y}`,
        denNgay: `31/12/${y}`,
        kyTruocTu: `01/01/${y - 1}`,
        kyTruocDen: `31/12/${y - 1}`,
        tuThang: '1',
        denThang: '12',
        nam: String(y)
      };
    } else {
      const hMatch = s.match(/^([12])H[\/\-_ ]?(\d{4})?$/);
      if (hMatch) {
        const h = parseInt(hMatch[1], 10);
        const y = parseInt(hMatch[2] || currentYear, 10);
        const startM = h === 1 ? 0 : 6;
        const endM = h === 1 ? 6 : 12;
        p = {
          labelKy: `${h}H_${y}`,
          tuNgay: formatDate(new Date(y, startM, 1)),
          denNgay: formatDate(new Date(y, endM, 0)),
          kyTruocTu: formatDate(new Date(y - 1, startM, 1)),
          kyTruocDen: formatDate(new Date(y - 1, endM, 0)),
          tuThang: h === 1 ? '1' : '7',
          denThang: h === 1 ? '6' : '12',
          nam: String(y)
        };
      } else {
        const qMatch = s.match(/^Q([1-4])[\/\-_ ]?(\d{4})?$/);
        if (qMatch) {
          const q = parseInt(qMatch[1], 10);
          const y = parseInt(qMatch[2] || currentYear, 10);
          p = {
            labelKy: `Q${q}_${y}`,
            tuNgay: formatDate(new Date(y, (q - 1) * 3, 1)),
            denNgay: formatDate(new Date(y, q * 3, 0)),
            kyTruocTu: formatDate(new Date(y - 1, (q - 1) * 3, 1)),
            kyTruocDen: formatDate(new Date(y - 1, q * 3, 0)),
            tuThang: String((q - 1) * 3 + 1),
            denThang: String(q * 3),
            nam: String(y)
          };
        } else {
          const mMatch = s.match(/^(?:T)?(\d{1,2})[\/\-_ ](\d{4})$/);
          if (mMatch) {
            p = parseMonthPeriod(parseInt(mMatch[1], 10), parseInt(mMatch[2], 10));
          } else {
            p = parseMonthPeriod(currentMonth, currentYear);
          }
        }
      }
    }

    if (fromStartOfYear && p) {
      p.tuNgay = `01/01/${p.nam}`;
      p.kyTruocTu = `01/01/${parseInt(p.nam, 10) - 1}`;
    }

    return p;
  }

  function parseMonthPeriod(m, y) {
    return {
      labelKy: `T${pad(m)}_${y}`,
      tuNgay: formatDate(new Date(y, m - 1, 1)),
      denNgay: formatDate(new Date(y, m, 0)),
      kyTruocTu: formatDate(new Date(y - 1, m - 1, 1)),
      kyTruocDen: formatDate(new Date(y - 1, m, 0)),
      tuThang: String(m),
      denThang: String(m),
      nam: String(y)
    };
  }

  function logPanel(msg) {
    const logBox = document.getElementById('fa-console-log');
    if (logBox) {
      logBox.innerText += `\n${msg}`;
      logBox.scrollTop = logBox.scrollHeight;
    }
  }

  function getIframeDoc() {
    const frame = document.getElementById('fast-automation-worker-iframe');
    return frame ? (frame.contentDocument || frame.contentWindow.document) : null;
  }

  function reloadMainReport() {
    try {
      const frame = document.getElementById('fast-automation-worker-iframe');
      const frameWin = frame ? frame.contentWindow : window;
      const targetWin = (frameWin && typeof frameWin.$find === 'function') ? frameWin : window;

      if (typeof targetWin.$find === 'function') {
        const report = targetWin.$find('ctl00_FastBusiness_MainReport');
        if (report && typeof report.goToPage === 'function') {
          report.goToPage(-1);
          logPanel(`🔄 Đã gọi lệnh Làm tươi báo cáo.`);
          return;
        }
      }

      const doc = getIframeDoc() || document;
      const links = Array.from(doc.querySelectorAll('a.PaddedLink, a'));
      const refreshLink = links.find(a => (a.innerText || '').includes('Làm tươi') || (a.getAttribute('onclick') || '').includes('goToPage(-1)'));
      if (refreshLink) {
        refreshLink.click();
        logPanel(`🔄 Đã click nút Làm tươi trên giao diện.`);
        return;
      }
      logPanel(`⚠ Không tìm thấy hàm $find('ctl00_FastBusiness_MainReport') để làm tươi.`);
    } catch (e) {
      logPanel(`❌ Lỗi khi làm tươi: ${e.message}`);
    }
  }

  async function loadPageInIframe(url) {
    const frame = document.getElementById('fast-automation-worker-iframe');
    const badge = document.getElementById('fa-preview-status');
    if (badge) badge.innerText = 'Đang nạp trang...';

    return new Promise((resolve) => {
      frame.onload = () => {
        if (badge) badge.innerText = 'Đã nạp xong';
        resolve(true);
      };
      frame.src = url;
    });
  }

  async function waitFrameSelector(selectorString, timeout = 35000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const doc = getIframeDoc();
      if (doc) {
        const parts = selectorString.split(',').map(s => s.trim());
        for (const s of parts) {
          let el = doc.querySelector(s);
          if (el) {
            if (el.tagName !== 'INPUT' && el.tagName !== 'SELECT') {
              const childInput = el.querySelector('input, select');
              if (childInput) return childInput;
            }
            return el;
          }
        }
      }
      await sleep(250);
    }
    return null;
  }

  function fillFrameInput(el, value) {
    if (!el) return;
    el.focus();
    el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  function selectFrameOption(selectEl, value, labelRegex) {
    if (!selectEl) return;
    let found = false;
    for (let i = 0; i < selectEl.options.length; i++) {
      if (selectEl.options[i].value === value || (labelRegex && labelRegex.test(selectEl.options[i].text))) {
        selectEl.selectedIndex = i;
        found = true;
        break;
      }
    }
    if (!found && selectEl.options.length > 0) selectEl.selectedIndex = 0;
    selectEl.dispatchEvent(new Event('change', { bubbles: true }));
  }

  async function triggerFrameExportAndDownload(taskName, dvcs, periodLabel) {
    const btnExp = await waitFrameSelector('#ctl00_FastBusiness_MainReport_ToolbarButton_Export', 15000);
    if (!btnExp) {
      logPanel(`⚠ Không tìm thấy nút Export Excel.`);
      return;
    }

    const cleanTitle = taskName.replace(/[/\\?%*:|"<>]/g, '_').trim();
    const cleanDvcs = dvcs ? dvcs.trim().replace(/[, ]+/g, '_') : 'TONG_HOP';
    const finalFileName = `${cleanTitle} - ${cleanDvcs} - ${periodLabel}.xlsx`;

    logPanel(`⏳ Đang tải file: ${finalFileName}...`);

    let interceptedUrl = null;
    const frame = document.getElementById('fast-automation-worker-iframe');
    const frameWin = frame.contentWindow;
    const originalOpen = frameWin.open;
    frameWin.open = function (url) {
      interceptedUrl = url;
      return null;
    };

    btnExp.click();
    await sleep(2000);
    frameWin.open = originalOpen;

    if (interceptedUrl) {
      try {
        const fullDownloadUrl = new URL(interceptedUrl, frameWin.location.href).href;
        const response = await fetch(fullDownloadUrl);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = finalFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);

        logPanel(`✔ Tải thành công: ${finalFileName}`);
      } catch (e) {
        const a = document.createElement('a');
        a.href = interceptedUrl;
        a.download = finalFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        logPanel(`✔ Kích hoạt tải: ${finalFileName}`);
      }
    }
  }

  function getActiveBranchesString() {
    const checkedBoxes = Array.from(document.querySelectorAll('.fa-chk-dvcs:checked')).map(c => c.value.trim());
    if (checkedBoxes.length > 0) {
      return checkedBoxes.join(', ');
    }
    const inputVal = document.getElementById('fa-dvcs-input');
    return inputVal ? inputVal.value.trim() : '';
  }

  let isRunning = false;
  async function processAutomationQueue(queue) {
    isRunning = true;
    const stopBtn = document.getElementById('fa-btn-stop');
    if (stopBtn) stopBtn.style.display = 'inline-block';
    logPanel(`\n>>> 🚀 BẮT ĐẦU CHẠY ${queue.length} TÁC VỤ...`);

    const fromStartOfYear = document.getElementById('fa-opt-from-start-year').checked;

    for (let i = 0; i < queue.length; i++) {
      if (!isRunning) break;
      const item = queue[i];
      const task = ALL_TASKS.find(t => t.code === item.taskCode);
      if (!task) continue;

      const times = resolveReportTimeRange(item.period, fromStartOfYear);
      const dvcs = item.dvcs;
      const targetUrl = `${BASE_PATH}${task.path}`;

      updateBrowserTabTitle(task.shortName, times.labelKy, dvcs);

      const titleEl = document.getElementById('fa-preview-title');
      if (titleEl) titleEl.innerText = `[${task.shortName}] ${task.name} (${times.labelKy})`;

      logPanel(`\n[${i + 1}/${queue.length}] ${task.name} | Kỳ: ${times.labelKy} (Từ: ${times.tuNgay} -> Đến: ${times.denNgay}) | ĐVCS: "${dvcs || ''}"`);

      await loadPageInIframe(targetUrl);
      await sleep(1500);

      const rawFirstInput = (task.inputType === 'DATE_HAN_TT') ? task.inputs.tinhDenNgay
        : ((task.inputType === 'DATE' || task.inputType === 'DATE_MULTI_CELL') ? task.inputs.tuNgay
        : (task.inputType === 'DATE_COMPARISON' ? (task.inputs.kyNayTu || task.inputs.kyNayDen) : (task.inputs.thang || task.inputs.tuThang)));

      let firstInput = await waitFrameSelector(rawFirstInput, 3000);
      if (!firstInput) {
        const btnSearch = await waitFrameSelector(DEFAULT_BTN_SEARCH, 3000);
        if (btnSearch) btnSearch.click();
        firstInput = await waitFrameSelector(rawFirstInput, 8000);
      }

      if (!firstInput) {
        logPanel(`❌ Lỗi: Không mở được form điều kiện lọc của báo cáo.`);
        continue;
      }

      if (task.inputType === 'DATE_HAN_TT') {
        fillFrameInput(firstInput, times.denNgay);
        const elNgayHtt = await waitFrameSelector(task.inputs.ngayTinhHtt, 3000);
        if (elNgayHtt) fillFrameInput(elNgayHtt, times.denNgay);
      } else if (task.inputType === 'DATE' || task.inputType === 'DATE_MULTI_CELL') {
        fillFrameInput(firstInput, times.tuNgay);
        fillFrameInput(await waitFrameSelector(task.inputs.denNgay), times.denNgay);
        if (task.inputs.tkList) fillFrameInput(await waitFrameSelector(task.inputs.tkList), '632,641,642,811');
        if (task.inputs.bcTheo) selectFrameOption(await waitFrameSelector(task.inputs.bcTheo), '1', /mã phí/i);
      } else if (task.inputType === 'DATE_COMPARISON') {
        if (task.inputs.kyNayTu) fillFrameInput(await waitFrameSelector(task.inputs.kyNayTu), times.tuNgay);
        if (task.inputs.kyNayDen) fillFrameInput(await waitFrameSelector(task.inputs.kyNayDen), times.denNgay);
        if (task.inputs.kyTruocTu) fillFrameInput(await waitFrameSelector(task.inputs.kyTruocTu), times.kyTruocTu);
        if (task.inputs.kyTruocDen) fillFrameInput(await waitFrameSelector(task.inputs.kyTruocDen), times.kyTruocDen);
        if (task.inputs.loaiBaoCao) {
          const defaultVal = task.code === 'cdkt' ? 'V20GLTC1B' : 'V20GLTC2B';
          selectFrameOption(await waitFrameSelector(task.inputs.loaiBaoCao), defaultVal, /200/i);
        }
      } else if (task.inputType === 'MONTH_DUAL_YEAR') {
        fillFrameInput(firstInput, times.tuThang);
        fillFrameInput(await waitFrameSelector(task.inputs.tuNam), times.nam);
        fillFrameInput(await waitFrameSelector(task.inputs.denThang), times.denThang);
        fillFrameInput(await waitFrameSelector(task.inputs.denNam), times.nam);
      } else if (task.inputs.denThang) {
        fillFrameInput(firstInput, times.tuThang);
        fillFrameInput(await waitFrameSelector(task.inputs.denThang), times.denThang);
        fillFrameInput(await waitFrameSelector(task.inputs.nam), times.nam);
      } else {
        fillFrameInput(firstInput, times.denThang);
        fillFrameInput(await waitFrameSelector(task.inputs.nam), times.nam);
      }

      if (task.inputs.nhomTheo) selectFrameOption(await waitFrameSelector(task.inputs.nhomTheo), '3', /vụ việc/i);
      if (task.inputs.nhomHdr) {
        const elHdr = await waitFrameSelector(task.inputs.nhomHdr, 2000);
        if (elHdr) fillFrameInput(elHdr, '0');
      }
      if (task.inputs.chonTt) selectFrameOption(await waitFrameSelector(task.inputs.chonTt), task.code === 'tk3' ? '5' : '0');
      if (task.code === 'tk3' && task.inputs.loaiBaoCao) selectFrameOption(await waitFrameSelector(task.inputs.loaiBaoCao), 'V20GLTHUE3_284');

      if (task.inputs.maDvcs) {
        let elDvcs = await waitFrameSelector(task.inputs.maDvcs, 4000);
        if (!elDvcs) {
          const doc = getIframeDoc();
          elDvcs = doc ? doc.querySelector('input[id*="ma_dvcs"], input[name*="ma_dvcs"]') : null;
        }

        if (elDvcs) {
          fillFrameInput(elDvcs, dvcs || '');
          logPanel(`✔ Đã điền ĐVCS: "${dvcs || ''}"`);
        } else {
          logPanel(`⚠ Không tìm thấy ô nhập ĐVCS trên form.`);
        }
      }

      await sleep(500);

      const btnOk = await waitFrameSelector(DEFAULT_BTN_OK, 5000);
      if (btnOk) {
        btnOk.click();
        logPanel(`✔ Đã bấm nút Nhận.`);
      } else {
        const doc = getIframeDoc();
        const altOk = doc ? doc.querySelector('[id*="updateDlgOk"], [id*="btnOk"]') : null;
        if (altOk) altOk.click();
      }

      await sleep(2500);

      if (['EXECUTE_GIA_TRUNG_BINH', 'EXECUTE_TINH_PB', 'EXECUTE_TINH_KH', 'EXECUTE_LAP_BT'].includes(task.inputType)) {
        const dlgOk = await waitFrameSelector(DIALOG_MSG_OK, 60000);
        if (dlgOk) dlgOk.click();
        logPanel(`✔ Hoàn thành: ${task.name}`);
      } else if (task.inputType === 'EXECUTE_KET_CHUYEN') {
        const btnAll = await waitFrameSelector('#ctl00_FastBusiness_MainReport_HeaderText_tag > div', 60000);
        if (btnAll) btnAll.click();
        const btnCreate = await waitFrameSelector('#ctl00_FastBusiness_MainReport_ToolbarButton_Create', 5000);
        if (btnCreate) btnCreate.click();
        logPanel(`✔ Đã tạo kết chuyển.`);
      } else if (task.inputType === 'EXECUTE_GIA_THANH') {
        const doc = getIframeDoc();
        const div = doc.querySelector("[id='ctl00_FastBusiness_MainReport_HeaderText_cast(0 as bit) as tag'] > div");
        if (div) div.click();
        const btnCalc = await waitFrameSelector('#ctl00_FastBusiness_MainReport_ToolbarButton_Calculate', 5000);
        if (btnCalc) btnCalc.click();
        logPanel(`✔ Đã tính giá thành.`);
      } else {
        if (item.autoDownload) {
          if (task.filterPanelInput && task.filterPanelValue) {
            const fInput = await waitFrameSelector(task.filterPanelInput, 10000);
            if (fInput) {
              fillFrameInput(fInput, task.filterPanelValue);
              fInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
              await sleep(1500);
            }
          }
          await triggerFrameExportAndDownload(task.name, dvcs, times.labelKy);
        } else {
          logPanel(`✔ Đã mở xong báo cáo: ${task.name}`);
        }
      }
      await sleep(1500);
    }

    isRunning = false;
    if (stopBtn) stopBtn.style.display = 'none';
    logPanel(`\n>>> 🎉 HOÀN TẤT TOÀN BỘ LƯỢT CHẠY!`);
  }

  // 4. Khởi tạo trạng thái và gắn sự kiện giao diện
  const now = new Date();
  const curDay = now.getDate();
  let defaultMonth = now.getMonth() + 1;
  let currentBaseYear = now.getFullYear();

  if (curDay < 10) {
    if (defaultMonth === 1) {
      defaultMonth = 12;
      currentBaseYear -= 1;
    } else {
      defaultMonth -= 1;
    }
  }

  let currentPeriodType = 'M';
  let currentPeriodVal = pad(defaultMonth);
  let batchMode = 'SINGLE';

  const getYear = () => parseInt(document.getElementById('fa-year-input').value, 10) || currentBaseYear;

  document.getElementById('fa-year-input').value = currentBaseYear;
  document.getElementById('fa-btn-close-root').onclick = () => {
    document.getElementById('fast-automation-root').remove();
  };

  document.getElementById('fa-btn-reload-report').onclick = () => {
    reloadMainReport();
  };

  document.getElementById('fa-btn-quick-export').onclick = () => {
    const doc = getIframeDoc();
    if (doc) {
      const expBtn = doc.querySelector('#ctl00_FastBusiness_MainReport_ToolbarButton_Export');
      if (expBtn) {
        expBtn.click();
        logPanel(`✔ Đã click nút Xuất Excel của Fast Business.`);
      } else {
        alert('Không tìm thấy nút Xuất Excel trên màn hình báo cáo hiện tại!');
      }
    }
  };

  const yearsContainer = document.getElementById('fa-years-container');
  for (let i = 4; i >= 0; i--) {
    const y = currentBaseYear - i;
    const lbl = document.createElement('label');
    lbl.className = 'fa-chk-tag';
    lbl.style.fontSize = '11px';
    lbl.innerHTML = `<input type="checkbox" class="fa-chk-year" value="${y}" ${y === getYear() ? 'checked' : ''}> ${y}`;
    yearsContainer.appendChild(lbl);
  }

  const monthsContainer = document.getElementById('fa-months-container');
  for (let m = 1; m <= 12; m++) {
    const mStr = pad(m);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `fa-btn btn-period-m ${mStr === currentPeriodVal ? 'active' : ''}`;
    btn.setAttribute('data-m', mStr);
    btn.innerText = `T${mStr}`;
    btn.onclick = () => {
      batchMode = 'SINGLE';
      currentPeriodType = 'M';
      currentPeriodVal = mStr;
      updatePeriodText();
    };
    monthsContainer.appendChild(btn);
  }

  document.querySelectorAll('.btn-period-q').forEach((b) => {
    b.onclick = () => {
      batchMode = 'SINGLE';
      currentPeriodType = 'Q';
      currentPeriodVal = b.getAttribute('data-q');
      updatePeriodText();
    };
  });

  document.querySelectorAll('.btn-period-h').forEach((b) => {
    b.onclick = () => {
      batchMode = 'SINGLE';
      currentPeriodType = 'H';
      currentPeriodVal = b.getAttribute('data-h');
      updatePeriodText();
    };
  });

  document.getElementById('fa-btn-fullyear').onclick = () => {
    batchMode = 'SINGLE';
    currentPeriodType = 'Y';
    currentPeriodVal = 'ALL';
    updatePeriodText();
  };

  function updatePeriodText() {
    const y = getYear();
    const txt = document.getElementById('fa-period-string');
    const fromInput = document.getElementById('fa-from-date-input');
    const toInput = document.getElementById('fa-to-date-input');
    const fromStartOfYear = document.getElementById('fa-opt-from-start-year').checked;

    document.querySelectorAll('.fa-btn').forEach((b) => b.classList.remove('active'));

    let pObj = null;
    if (currentPeriodType === 'M') {
      txt.value = `${currentPeriodVal}/${y}`;
      const b = document.querySelector(`.btn-period-m[data-m="${currentPeriodVal}"]`);
      if (b) b.classList.add('active');
      pObj = parseMonthPeriod(parseInt(currentPeriodVal, 10), y);
    } else if (currentPeriodType === 'Q') {
      txt.value = `Q${currentPeriodVal}/${y}`;
      const b = document.querySelector(`.btn-period-q[data-q="${currentPeriodVal}"]`);
      if (b) b.classList.add('active');
      const q = parseInt(currentPeriodVal, 10);
      pObj = {
        tuNgay: formatDate(new Date(y, (q - 1) * 3, 1)),
        denNgay: formatDate(new Date(y, q * 3, 0))
      };
    } else if (currentPeriodType === 'H') {
      txt.value = `${currentPeriodVal}H/${y}`;
      const b = document.querySelector(`.btn-period-h[data-h="${currentPeriodVal}"]`);
      if (b) b.classList.add('active');
      const h = parseInt(currentPeriodVal, 10);
      pObj = {
        tuNgay: formatDate(new Date(y, h === 1 ? 0 : 6, 1)),
        denNgay: formatDate(new Date(y, h === 1 ? 6 : 12, 0))
      };
    } else if (currentPeriodType === 'Y') {
      txt.value = `${y}`;
      document.getElementById('fa-btn-fullyear').classList.add('active');
      pObj = {
        tuNgay: `01/01/${y}`,
        denNgay: `31/12/${y}`
      };
    }

    if (pObj && fromInput && toInput) {
      fromInput.value = fromStartOfYear ? `01/01/${y}` : pObj.tuNgay;
      toInput.value = pObj.denNgay;
    }
  }

  document.getElementById('fa-opt-from-start-year').onchange = () => {
    updatePeriodText();
  };

  document.getElementById('fa-step-dec').onclick = () => {
    document.getElementById('fa-year-input').value = getYear() - 1;
    updatePeriodText();
  };
  document.getElementById('fa-step-inc').onclick = () => {
    document.getElementById('fa-year-input').value = getYear() + 1;
    updatePeriodText();
  };

  document.getElementById('fa-combo-12m').onclick = () => {
    batchMode = 'ALL_MONTHS';
    document.getElementById('fa-period-string').value = `[12 Tháng năm ${getYear()}]`;
  };
  document.getElementById('fa-combo-4q').onclick = () => {
    batchMode = 'ALL_QUARTERS';
    document.getElementById('fa-period-string').value = `[4 Quý năm ${getYear()}]`;
  };
  document.getElementById('fa-combo-all').onclick = () => {
    batchMode = 'FULL_YEAR_COMBO';
    document.getElementById('fa-period-string').value = `[Cả Năm + 4 Quý năm ${getYear()}]`;
  };

  const dvcsInput = document.getElementById('fa-dvcs-input');
  const syncDvcs = () => {
    const chks = Array.from(document.querySelectorAll('.fa-chk-dvcs:checked')).map((c) => c.value);
    dvcsInput.value = chks.join(', ');
  };
  syncDvcs();
  document.querySelectorAll('.fa-chk-dvcs').forEach((c) => (c.onchange = syncDvcs));
  document.getElementById('fa-dvcs-all').onclick = () => {
    document.querySelectorAll('.fa-chk-dvcs').forEach((c) => (c.checked = true));
    syncDvcs();
  };
  document.getElementById('fa-dvcs-none').onclick = () => {
    document.querySelectorAll('.fa-chk-dvcs').forEach((c) => (c.checked = false));
    syncDvcs();
  };

  // Render danh mục công việc
  const taskContainer = document.getElementById('fa-task-container');
  TASK_GROUPS.forEach((g) => {
    const grpBox = document.createElement('div');
    grpBox.innerHTML = `
      <div class="fa-group-header">
        <span>[NHÓM ${g.groupCode}] ${g.groupName}</span>
        <div>
          <button type="button" class="fa-btn" style="padding:1px 4px;font-size:10px;" onclick="document.querySelectorAll('.chk-grp-${g.groupCode}').forEach(c=>c.checked=true)">Chọn</button>
          <button type="button" class="fa-btn" style="padding:1px 4px;font-size:10px;" onclick="document.querySelectorAll('.chk-grp-${g.groupCode}').forEach(c=>c.checked=false)">Bỏ</button>
        </div>
      </div>
      <div class="fa-group-items" id="grp_items_${g.groupCode}"></div>
    `;
    taskContainer.appendChild(grpBox);

    const itemsBox = grpBox.querySelector(`#grp_items_${g.groupCode}`);
    g.items.forEach((t) => {
      const row = document.createElement('div');
      row.className = 'fa-task-item';
      row.innerHTML = `
        <input type="checkbox" class="fa-chk-task chk-grp-${g.groupCode}" value="${t.code}" id="fa_task_${t.code}">
        <span class="fa-badge-action" title="Nhấp vào để chạy ngay báo cáo này!">${t.code.toUpperCase()}</span>
        <label for="fa_task_${t.code}" style="cursor:pointer; flex:1;">
          ${t.name} <span style="color:#94a3b8; font-size:11px;">(${t.shortName})</span>
        </label>
      `;

      const badgeBtn = row.querySelector('.fa-badge-action');
      badgeBtn.onclick = (e) => {
        e.stopPropagation();
        runSingleTaskImmediately(t.code);
      };

      itemsBox.appendChild(row);
    });
  });

  function runSingleTaskImmediately(taskCode) {
    const period = document.getElementById('fa-period-string').value;
    const branches = getActiveBranchesString();
    const autoDownload = document.getElementById('fa-opt-auto-dl').checked;

    const queue = [{
      taskCode: taskCode,
      period: period,
      dvcs: branches,
      autoDownload: autoDownload
    }];

    processAutomationQueue(queue);
  }

  document.getElementById('fa-task-select-all').onclick = () => {
    document.querySelectorAll('.fa-chk-task').forEach((c) => (c.checked = true));
  };
  document.getElementById('fa-task-select-none').onclick = () => {
    document.querySelectorAll('.fa-chk-task').forEach((c) => (c.checked = false));
  };
  document.getElementById('fa-task-select-rep').onclick = () => {
    const repCodes = ['cdkt', 'nkc', 'cd', 'kq', 'cp', 'nxt', 'vb', 'nxtk', 'bh', 'mv', 'br', 'tk3', 'kh', 'cc', 'cn', 'htt'];
    document.querySelectorAll('.fa-chk-task').forEach((c) => {
      c.checked = repCodes.includes(c.value);
    });
  };

  document.getElementById('fa-btn-stop').onclick = () => {
    isRunning = false;
    logPanel(`🛑 ĐÃ DỪNG TIẾN TRÌNH TỰ ĐỘNG!`);
    document.getElementById('fa-btn-stop').style.display = 'none';
  };

  document.getElementById('fa-btn-run').onclick = () => {
    const selectedTasks = Array.from(document.querySelectorAll('.fa-chk-task:checked')).map((c) => c.value);
    if (selectedTasks.length === 0) {
      alert('Vui lòng tích chọn ít nhất 1 nghiệp vụ/báo cáo!');
      return;
    }

    const splitYears = document.getElementById('fa-opt-split-year').checked;
    let targetYears = [];
    if (splitYears) {
      targetYears = Array.from(document.querySelectorAll('.fa-chk-year:checked')).map((c) => parseInt(c.value, 10));
    }
    if (targetYears.length === 0) targetYears = [getYear()];

    let periodsToRun = [];
    targetYears.forEach((y) => {
      if (batchMode === 'ALL_MONTHS') {
        for (let m = 1; m <= 12; m++) periodsToRun.push(`${pad(m)}/${y}`);
      } else if (batchMode === 'ALL_QUARTERS') {
        periodsToRun.push(`Q1/${y}`, `Q2/${y}`, `Q3/${y}`, `Q4/${y}`);
      } else if (batchMode === 'FULL_YEAR_COMBO') {
        periodsToRun.push(`${y}`, `Q1/${y}`, `Q2/${y}`, `Q3/${y}`, `Q4/${y}`);
      } else {
        if (currentPeriodType === 'M') periodsToRun.push(`${currentPeriodVal}/${y}`);
        else if (currentPeriodType === 'Q') periodsToRun.push(`Q${currentPeriodVal}/${y}`);
        else if (currentPeriodType === 'H') periodsToRun.push(`${currentPeriodVal}H/${y}`);
        else periodsToRun.push(`${y}`);
      }
    });

    const branchesStr = getActiveBranchesString();
    const splitDvcs = document.getElementById('fa-opt-split-dvcs').checked;
    let branchList = [''];
    if (branchesStr) {
      const tokens = branchesStr.split(',').map((s) => s.trim()).filter(Boolean);
      if (splitDvcs && tokens.length > 1) {
        branchList = tokens;
      } else {
        branchList = [branchesStr];
      }
    }

    const autoDownload = document.getElementById('fa-opt-auto-dl').checked;
    const queue = [];
    for (const p of periodsToRun) {
      for (const b of branchList) {
        for (const t of selectedTasks) {
          queue.push({
            taskCode: t,
            period: p,
            dvcs: b,
            autoDownload: autoDownload
          });
        }
      }
    }

    processAutomationQueue(queue);
  };

  updatePeriodText();
})();