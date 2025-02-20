import Link from 'next/link';

export default function SecondPage() {
  return (
    <div style={{ display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: '200px', backgroundColor: 'grey', padding: '20px' }}>
        <h2>Navigation</h2>
        <ul>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/second">Second Page</Link>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div style={{ padding: '20px' }}>
        <h1>Hello from the Second Page!</h1>
      </div>
    </div>
  );
}
