import http from './index';

console.log('Starting Http Client Test');
console.log(http.version);

async function ok() {
  await http.get('/api/a/b/c');
  await http.post('/api/{a}/{b}/c', {
    paths: { a: 1, b: 2 },
    microAlias: 'auth',
    prefix: '/real',
    env: undefined,
    mock: false,
  });
  await http.put('/api/{a}/{b}/{c}/222', { paths: { a: 1, b: 2 } });
}

document.getElementById('ok').onclick = async () => {
  document.getElementById('version').innerText = http.version;
  await ok();
};
