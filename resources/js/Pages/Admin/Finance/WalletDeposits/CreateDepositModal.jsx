<div className="stat-detail-overlay" onClick={onClose}>
    <div
        className="stat-detail-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "480px" }}
    >
        <div
            className="stat-detail-header"
            style={{ background: "#ecfdf5", borderColor: "#a7f3d0" }}
        >
            <div
                className="stat-detail-icon"
                style={{ background: "#065f46", color: "#fff" }}
            >
                <Plus size={24} />
            </div>
            <div className="stat-detail-header-content">
                <h3 style={{ color: "#065f46" }}>شارژ دستی کیف پول</h3>
                <p className="stat-detail-desc">
                    مبلغ را به کیف پول کاربر اضافه کنید
                </p>
            </div>
            <button
                type="button"
                className="stat-detail-close"
                onClick={onClose}
            >
                <X size={20} />
            </button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: "1.25rem 1.5rem" }}>
            <div className="filter-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label">
                    کاربر <span className="required">*</span>
                </label>
                <select
                    className="filter-select"
                    value={form.user_id}
                    onChange={(e) =>
                        setForm({ ...form, user_id: e.target.value })
                    }
                    disabled={isLoading}
                >
                    <option value="">انتخاب کنید...</option>
                    {users.map((u) => (
                        <option key={u.id} value={u.id}>
                            {u.name} {u.phone ? `(${u.phone})` : ""}
                        </option>
                    ))}
                </select>
                {errors.user_id && (
                    <div className="form-error">{errors.user_id}</div>
                )}
            </div>
            <div className="filter-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label">
                    مبلغ (تومان) <span className="required">*</span>
                </label>
                <input
                    type="number"
                    className="filter-input"
                    value={form.amount}
                    onChange={(e) =>
                        setForm({ ...form, amount: e.target.value })
                    }
                    placeholder="مثلاً 100000"
                    min={1000}
                    max={500000000}
                    disabled={isLoading}
                />
                {errors.amount && (
                    <div className="form-error">{errors.amount}</div>
                )}
            </div>
            <div className="filter-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label">توضیحات</label>
                <textarea
                    className="filter-input"
                    value={form.description}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            description: e.target.value,
                        })
                    }
                    placeholder="دلیل شارژ (اختیاری)"
                    rows={3}
                    maxLength={500}
                    disabled={isLoading}
                    style={{ resize: "vertical" }}
                />
            </div>
            <div
                className="stat-detail-footer"
                style={{
                    padding: 0,
                    borderTop: "none",
                    marginTop: "1rem",
                }}
            >
                <button
                    type="submit"
                    className="btn-primary"
                    disabled={isLoading}
                    style={{ flex: 1, justifyContent: "center" }}
                >
                    {isLoading ? (
                        <>
                            <span className="spinner"></span>در حال شارژ...
                        </>
                    ) : (
                        <>
                            <CheckCircle size={14} />
                            شارژ کیف پول
                        </>
                    )}
                </button>
                <button
                    type="button"
                    className="btn-secondary"
                    onClick={onClose}
                    disabled={isLoading}
                >
                    انصراف
                </button>
            </div>
        </form>
    </div>
</div>;
