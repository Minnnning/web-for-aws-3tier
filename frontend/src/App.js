import React, { useState, useEffect } from 'react';
import './App.css';

// AWS 배포 시 이 URL을 로드밸런서의 주소로 변경해야 합니다.
const API_URL = 'http://localhost:8000';

function App() {
  const [entries, setEntries] = useState([]);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');

  // 컴포넌트가 처음 렌더링될 때 방명록 목록을 가져옵니다.
  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await fetch(`${API_URL}/entries`);
      const data = await response.json();
      setEntries(data);
    } catch (error) {
      console.error("Error fetching entries:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!author || !content) {
      alert("이름과 내용을 모두 입력해주세요.");
      return;
    }

    try {
      await fetch(`${API_URL}/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ author, content }),
      });
      // 전송 성공 후 입력 필드 초기화 및 목록 새로고침
      setAuthor('');
      setContent('');
      fetchEntries();
    } catch (error) {
      console.error("Error creating entry:", error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>방명록</h1>
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="이름"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
            <textarea
              placeholder="내용을 입력하세요..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <button type="submit">작성하기</button>
          </form>
        </div>
        <div className="entries-container">
          {entries.map((entry) => (
            <div key={entry.id} className="entry">
              <p><strong>{entry.author}</strong> <span>({new Date(entry.created_at).toLocaleString()})</span></p>
              <p>{entry.content}</p>
            </div>
          ))}
        </div>
      </header>
    </div>
  );
}

export default App;
