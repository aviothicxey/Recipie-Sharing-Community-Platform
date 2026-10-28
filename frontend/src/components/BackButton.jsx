import { useNavigate } from 'react-router-dom';

function BackButton({ fallback, label }) {
  const navigate = useNavigate();

  function goBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(fallback);
  }

  return (
    <div className="back-navigation">
      <button type="button" onClick={goBack} aria-label={`Back to ${label.toLowerCase()}`}>
        <span aria-hidden="true">←</span> Back to {label}
      </button>
    </div>
  );
}

export default BackButton;
