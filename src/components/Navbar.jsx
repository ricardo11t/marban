import React, { useState } from 'react';
import { Menu, MenuItem, IconButton, ListItemIcon, ListItemText, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import ClassIcon from '@mui/icons-material/School'; // Escolha ícones que representem melhor sua ideia
import RaceIcon from '@mui/icons-material/EmojiPeople';

export default function HoverDropdown() {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMouseEnter = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMouseLeave = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    return (
        <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ display: 'inline-block' }}
            className='mt-5'
        >

            <Button
                variant="contained"
                sx={{
                    backgroundColor: 'darkgray',
                    color: 'white',
                    height: '38px',
                    paddingX: 2,
                    borderRadius: '6px',
                    '&:hover': {
                        backgroundColor: 'gray',
                    },
                }}
                startIcon={<MenuIcon />}
            >
                MAIS
            </Button>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMouseLeave}
                MenuListProps={{
                    onMouseLeave: handleMouseLeave,
                    style: { pointerEvents: 'auto' },
                }}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                <Link to="/criacao" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <MenuItem onClick={handleMouseLeave}>
                        <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Criação de Personagem</ListItemText>
                    </MenuItem>
                </Link>

                <Link to="/classes" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <MenuItem onClick={handleMouseLeave}>
                        <ListItemIcon><ClassIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Classes</ListItemText>
                    </MenuItem>
                </Link>

                <Link to="/racas" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <MenuItem onClick={handleMouseLeave}>
                        <ListItemIcon><RaceIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Raças</ListItemText>
                    </MenuItem>
                </Link>
            </Menu>
        </div>
    );
}