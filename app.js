const CONFIG = Object.freeze({
  endpoint: 'https://script.google.com/macros/s/AKfycbxP2r-avMv2qqE0xXs-5X0h6iRnOmojk9PjyAqcJWk_Dv9EkmMGhHOssfn_hgwrV2V2/exec',
  timeoutMs: 12000
});

const STATIONS = Object.freeze({
  'vinh-long-2': 'VĨNH LONG 2',
  'vinh-long-3': 'VĨNH LONG 3',
  'an-giang-1': 'AN GIANG 1',
  'an-giang-2': 'AN GIANG 2',
  'an-giang-3': 'AN GIANG 3',
  'dong-thap-1': 'ĐỒNG THÁP 1',
  'dong-thap-2': 'ĐỒNG THÁP 2',
  'sctv-14': 'SCTV 14',
  'sctv-4': 'SCTV 4',
  'ca-mau': 'CÀ MAU',
  'can-tho': 'CẦN THƠ',
  'youtv': 'YOUTV'
});

function stationSlug() {
  const fromPage = document.documentElement.dataset.station || '';
  const query = new URLSearchParams(location.search).get('station') || '';
  return (fromPage || query).toLowerCase();
}

function scanMetadata() {
  const ua = navigator.userAgent || '';
  const os = /Android/i.test(ua) ? 'Android' : /iPhone|iPad|iPod/i.test(ua) ? 'iOS/iPadOS' : /Windows/i.test(ua) ? 'Windows' : /Macintosh|Mac OS X/i.test(ua) ? 'macOS' : /Linux/i.test(ua) ? 'Linux' : 'Không xác định';
  const device = /iPad|Tablet/i.test(ua) ? 'Máy tính bảng' : /Mobile|Android|iPhone|iPod/i.test(ua) ? 'Điện thoại' : 'Máy tính/khác';
  const browser = /Zalo/i.test(ua) ? 'Trình duyệt Zalo' : /SamsungBrowser/i.test(ua) ? 'Samsung Internet' : /Edg/i.test(ua) ? 'Microsoft Edge' : /CriOS|Chrome/i.test(ua) ? 'Chrome' : /FxiOS|Firefox/i.test(ua) ? 'Firefox' : /Safari/i.test(ua) ? 'Safari' : 'Không xác định';
  const scanMethod = /Zalo/i.test(ua) ? 'Zalo (dự đoán)' : /FBAN|FBAV|Instagram|TikTok/i.test(ua) ? 'Trình duyệt nhúng ứng dụng (dự đoán)' : 'Camera hoặc trình duyệt mặc định (không xác định)';
  return { scanMethod, device, os, browser };
}

function showError(message) {
  document.getElementById('spinner').hidden = true;
  document.getElementById('title').textContent = 'Chưa thể kết nối';
  document.getElementById('message').textContent = message;
}

function start() {
  const slug = stationSlug();
  if (!STATIONS[slug]) {
    showError('Đường dẫn nhà đài không hợp lệ.');
    return;
  }
  if (!/^https:\/\/script\.google\.com\//.test(CONFIG.endpoint)) {
    showError('Hệ thống chưa được phát hành.');
    return;
  }
  const callback = '__zaloResolve' + Date.now();
  const timer = setTimeout(() => {
    delete window[callback];
    showError('Kết nối đang bận. Vui lòng quét lại sau.');
  }, CONFIG.timeoutMs);
  window[callback] = result => {
    clearTimeout(timer);
    delete window[callback];
    if (!result || !result.ok || !result.link) {
      showError(result && result.message ? result.message : 'Hiện chưa có tài khoản Zalo đang hoạt động.');
      return;
    }
    const go = document.getElementById('go');
    go.href = result.link;
    document.getElementById('manual').hidden = false;
    location.replace(result.link);
  };
  const query = new URLSearchParams({ action: 'resolve', station: slug, callback, ...scanMetadata(), _: String(Date.now()) });
  const script = document.createElement('script');
  script.src = CONFIG.endpoint + '?' + query.toString();
  script.onerror = () => {
    clearTimeout(timer);
    delete window[callback];
    showError('Không kết nối được máy chủ phân bổ Zalo.');
  };
  document.head.appendChild(script);
}

start();

