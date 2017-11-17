import React from 'react';

function TipText({
    tipContent,
    tipColor
  }) {
  return (
    <div style={{ color: tipColor }}>
      {tipContent}
    </div>
  );
}
TipText.View = function TipTextView({
    tipContent,
    tipColor
  }) {
  return (
    <div style={{ color: tipColor }}>
      {tipContent}
    </div>
  );
}

export default TipText;
