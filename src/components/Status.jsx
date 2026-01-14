function Status({ status }) {
  if (!status.message) return <div className="status" />;

  return <div className={`status ${status.type}`}>{status.message}</div>;
}

export default Status;
