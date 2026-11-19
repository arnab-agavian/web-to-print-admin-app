import React from 'react';

export default function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="page-head">
      <div><p>{eyebrow}</p><h1>{title}</h1><span>{description}</span></div>
      {action}
    </div>
  );
}
