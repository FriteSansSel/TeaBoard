import React from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '../utils/constants';
import './BackButton.css';

const BackButton = () => {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate(routes.menu);
    }

    return (
        <button className="back-button" onClick={handleBack}>
            Retour
        </button>
    )
}

export default BackButton;