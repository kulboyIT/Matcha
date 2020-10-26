import React, { useEffect, useState } from 'react';
import { ListItem, ListItemText, ListItemAvatar, Avatar } from '@material-ui/core';
import OnlineBadge from './OnlineBadge';

const ConversationBox = ({
    unread,
    conversation,
    active,
    handleChange,
    partnerTyping,
    lastMessage,
    socket,
}) => {
    const [partnerIsOnline, setPartnerIsOnline] = useState({ online: false, partnerId: 0 });

    useEffect(() => {
        let isMounted = true;
        socket.on('ONLINE', (userId, online) => {
            // console.log('in box on online', userId, online);
            if (isMounted) {
                setPartnerIsOnline({ online: online, partnerId: userId });
            }
        });
        return () => {
            isMounted = false;
        };
    }, [partnerIsOnline, socket]);

    const amount = (amount) => {
        return amount < 100 ? amount : '99+';
    };

    return (
        <ListItem
            style={{
                borderBottom: '1px solid #003781',
                backgroundColor: active === conversation.partner_username ? '#003781' : 'inherit',
            }}
            button
            onClick={(e) => handleChange(e, conversation.partner_username, conversation.sender_id)}
            alignItems="flex-start">
            <ListItemAvatar>
                <Avatar alt={conversation.partner_username} src={conversation.avatar} />
            </ListItemAvatar>
            <ListItemText
                primary={
                    <>
                        {conversation.partner_username}{' '}
                        <div style={{ float: 'right', color: '#b5bad3' }}>
                            <OnlineBadge
                                lastSeen={
                                    partnerIsOnline.partnerId === conversation.partner_id &&
                                    partnerIsOnline.online
                                        ? 'online'
                                        : conversation.last_seen
                                }
                            />
                            {/* {partnerIsOnline.partnerId === conversation.partner_id &&
                            partnerIsOnline.online
                                ? 'online'
                                : days(conversation.last_seen)} */}
                        </div>
                    </>
                }
                secondary={
                    <>
                        {partnerTyping.typing && partnerTyping.chatId === conversation.chat_id
                            ? 'is typing...'
                            : lastMessage.chatId === conversation.chat_id
                            ? lastMessage.text
                            : conversation.last_message}{' '}
                        <span style={{ float: 'right', color: 'red', fontSize: '16px' }}>
                            {unread ? amount(unread) : ''}
                        </span>
                    </>
                }
            />
        </ListItem>
    );
};

export default ConversationBox;
