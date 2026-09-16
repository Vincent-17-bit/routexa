CREATE TRIGGER IF NOT EXISTS trg_block_delete_login_logs
BEFORE DELETE ON login_logs
BEGIN
  SELECT RAISE(ABORT, 'hard delete not allowed');
END;

CREATE TRIGGER IF NOT EXISTS trg_block_delete_search_logs
BEFORE DELETE ON search_logs
BEGIN
  SELECT RAISE(ABORT, 'hard delete not allowed');
END;

CREATE TRIGGER IF NOT EXISTS trg_block_delete_route_logs
BEFORE DELETE ON route_logs
BEGIN
  SELECT RAISE(ABORT, 'hard delete not allowed');
END;
