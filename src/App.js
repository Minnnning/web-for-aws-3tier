import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [entries, setEntries] = useState([]);
  const [content, setContent] = useState('');
  // 백엔드 서버 주소를 저장하기 위한 상태 추가
  const [backendAddress, setBackendAddress] = useState('확인 중...');

  // 컴포넌트가 처음 렌더링될 때 데이터와 백엔드 주소를 가져옵니다.
  useEffect(() => {
    fetchBackendAddress();
    fetchEntries();
  }, []);

  // 백엔드 서버 주소를 확인하는 함수 (로드밸런싱 확인용)
  const fetchBackendAddress = async () => {
    try {
      // '/api/health' 엔드포인트는 백엔드에서 서버 정보를 반환하도록 구현해야 합니다.
      const response = await fetch('/api/health');
      const data = await response.json();
      // 백엔드 응답에 'hostname' 또는 'server_ip' 같은 필드가 있다고 가정
      setBackendAddress(data.message || '정보 없음');
    } catch (error) {
      console.error("Error fetching backend address:", error);
      setBackendAddress('연결 실패');
    }
  };


  // 데이터를 가져오는 함수
  const fetchEntries = async () => {
    try {
      // 백엔드 API 경로를 '/api/data'로 수정
      const response = await fetch('/api/data');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setEntries(data);
    } catch (error) {
      console.error("Error fetching entries:", error);
    }
  };

  // 데이터 생성을 처리하는 함수
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content) {
      alert("내용을 입력해주세요.");
      return;
    }
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      setContent('');
      fetchEntries(); // 목록 새로고침
    } catch (error) {
      console.error("Error creating entry:", error);
    }
  };

  // --- 새로 추가된 삭제 기능 ---
  const handleDelete = async (id) => {
    // 사용자에게 삭제 여부 확인
    if (window.confirm(`정말로 이 항목을 삭제하시겠습니까? (ID: ${id})`)) {
      try {
        const response = await fetch(`/api/data/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('삭제에 실패했습니다.');
        }
        alert('삭제되었습니다.');
        fetchEntries(); // 삭제 후 목록 새로고침
      } catch (error) {
        console.error("Error deleting entry:", error);
        alert(error.message);
      }
    }
  };


  return (
    <div className="container">
      <header>
        <h1>Simple Board 2</h1>
        <p className="backend-info">
          연결된 백엔드: <span>{backendAddress}</span>
        </p>
      </header>

      <main>
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <textarea
              placeholder="내용을 작성해주세요..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="4"
            />
            <button type="submit">저장하기</button>
          </form>
        </div>

        <div className="entries-container">
          {entries.length > 0 ? entries.map((entry) => (
            <div key={entry.id} className="entry-card">
              <p className="entry-content">{entry.content}</p>
              <div className="entry-footer">
                <span className="entry-date">
                  {new Date(entry.created_at).toLocaleString()}
                </span>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(entry.id)}
                >
                  삭제
                </button>
              </div>
            </div>
          )) : <p>아직 기록이 없습니다.</p>}
        </div>
      </main>
    </div>
  );
}

export default App;