DROP TRIGGER IF EXISTS trg_update_token_balance;

DELIMITER $$
CREATE TRIGGER trg_update_token_balance
AFTER INSERT ON token_ledger_entries
FOR EACH ROW 
BEGIN
    IF NEW.entryType IN ('PURCHASE', 'REFUND', 'ADJUSTMENT') THEN
        UPDATE User 
        SET availableBalance = availableBalance + NEW.amount,
            updatedAt = NOW()
        WHERE id = NEW.userId;
    END IF;
END$$
DELIMITER ;
