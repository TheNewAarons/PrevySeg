import { useNavigate } from "react-router-dom";

const BotonVolver = () => {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate(-1)}
            style={{
                padding: "8px 15px",
                background: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                marginBottom: "20px"
            }}
        >
            Volver
        </button>
    );
};

export default BotonVolver;