function BarberCard({ barber }) {
    return (
        <Link
            href={route("public.barbers.show", barber.id)}
            className="barber-card"
        >
            <div className="barber-card-avatar">
                {barber.avatar ? (
                    <img src={barber.avatar} alt={barber.name} />
                ) : (
                    <div className="barber-card-avatar-placeholder">
                        {barber.name?.charAt(0)}
                    </div>
                )}
                {barber.is_online && <span className="online-dot" />}
            </div>

            <div className="barber-card-content">
                <h3 className="barber-card-name">{barber.name}</h3>
                <p className="barber-card-specialty">{barber.specialty}</p>
                <div className="barber-card-rating">
                    <Star size={14} fill="currentColor" />
                    <span>{toPersianNumber(barber.rating)}</span>
                    <span className="rating-count">
                        ({toPersianNumber(barber.reviews_count)})
                    </span>
                </div>
                <div className="barber-card-city">
                    <MapPin size={12} />
                    {barber.city}
                </div>
            </div>

            <button className="barber-card-btn">
                <Calendar size={14} />
                رزرو نوبت
            </button>
        </Link>
    );
}
