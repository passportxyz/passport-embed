export const LoadingIcon = () => (
  <svg width="40" height="31" viewBox="0 0 40 31" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 8C0 3.58172 3.58172 0 8 0H32C36.4183 0 40 3.58172 40 8V23C40 27.4183 36.4183 31 32 31H8C3.58172 31 0 27.4183 0 23V8Z" fill="#3B3B3B"/>
    <circle cx="11" cy="18.5" r="3" fill="white">
      <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" begin="0s" />
    </circle>
    <circle cx="20" cy="18.5" r="3" fill="white">
      <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" begin="0.5s" />
    </circle>
    <circle cx="29" cy="18.5" r="3" fill="white">
      <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" begin="1s" />
    </circle>
  </svg>
);