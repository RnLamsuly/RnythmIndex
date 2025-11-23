const app = {
    playersData: null,

    init: function() {
        this.loadData();
    },

    async loadData() {
        try {
            const response = await fetch('data/players.json');
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            this.playersData = await response.json();
            this.renderAll();
        } catch (error) {
            console.error('加载数据失败:', error);
            this.showError('leaderboard', '数据加载失败: ' + error.message);
        }
    },

    sortPlayers(players, sortBy = 'score', order = 'desc') {
        return [...players].sort((a, b) => {
            let valueA = a[sortBy];
            let valueB = b[sortBy];
            
            if (typeof valueA === 'number' && typeof valueB === 'number') {
                return order === 'desc' ? valueB - valueA : valueA - valueB;
            } else {
                valueA = String(valueA).toLowerCase();
                valueB = String(valueB).toLowerCase();
                return order === 'desc' 
                    ? valueB.localeCompare(valueA) 
                    : valueA.localeCompare(valueB);
            }
        });
    },

    renderLeaderboard() {
        const container = document.getElementById('leaderboard');
        
        if (!this.playersData || !this.playersData.players) {
            this.showError('leaderboard', '数据加载失败');
            return;
        }

        // 自动按分数排序
        const sortedPlayers = this.sortPlayers(this.playersData.players, 'score', 'desc');
        
        let html = '';
        sortedPlayers.forEach((player, index) => {
            const rank = index + 1;
            const top3Class = rank <= 3 ? 'top-3' : '';
            const rankClass = `rank-${rank}`;
            const changeClass = player.scoreChange >= 0 ? 'positive' : 'negative';
            const changeSymbol = player.scoreChange >= 0 ? '+' : '';
            
            let avatarHtml = '';
            const avatarText = player.avatarText || player.name.charAt(0);
            
            if (player.avatar && (player.avatar.startsWith('http') || player.avatar.includes('.'))) {
                avatarHtml = `<img class="avatar-img" src="${player.avatar}" alt="${player.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />`;
            }
            
            html += `
                <div class="player-row ${top3Class}">
                    <div class="rank ${rankClass}">${rank}</div>
                    <div class="player-info">
                        <div class="avatar-container">
                            ${avatarHtml}
                            <div class="avatar" style="${avatarHtml ? 'display:none;' : ''}">${avatarText}</div>
                        </div>
                        <div>
                            <div class="player-name permission-${player.Permission || 3}">${player.name}</div>
                            <div class="player-id">${player.id} • ${player.matchesPlayed}场</div>
                        </div>
                    </div>
                    <div class="player-score">
                        ${player.score}
                        <span class="score-change ${changeClass}">
                            ${changeSymbol}${player.scoreChange}
                        </span>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    },

    renderStats() {
        const container = document.getElementById('statsGrid');
        const { system } = this.playersData;
        
        // 使用JSON中的总玩家数，不自动计算
        container.innerHTML = `
            <div class="stat-card">
                <div class="stat-label">总玩家数</div>
                <div class="stat-value">${system.totalPlayers}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">已举办比赛</div>
                <div class="stat-value">${system.totalMatches}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">平均比赛人数</div>
                <div class="stat-value">${system.averageParticipants}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">最高分数</div>
                <div class="stat-value">${system.highestScore || this.getHighestScore()}</div>
            </div>
        `;
    },

    renderRecentMatches() {
        const container = document.getElementById('recentMatches');
        
        let html = '';
        this.playersData.recentMatches.forEach(match => {
            html += `
                <div class="match-item">
                    <div>
                        <div style="color: var(--gray); font-size: 0.9rem;">${match.date}</div>
                        <div style="font-weight: 500;">${match.winner} 获胜</div>
                        <div style="color: var(--gray); font-size: 0.8rem;">${match.type}</div>
                    </div>
                    <div style="color: var(--gray); font-size: 0.9rem;">${match.participants}人参赛</div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    },

    renderSystemInfo() {
        const container = document.getElementById('systemInfo');
        const { system } = this.playersData;
        
        container.innerHTML = `
            <div style="margin-bottom: 1rem;">
                <div style="color: var(--gray); font-size: 0.9rem;">K因子</div>
                <div style="font-weight: 500; color: var(--accent);">${system.kFactor}</div>
            </div>
            <div style="margin-bottom: 1rem;">
                <div style="color: var(--gray); font-size: 0.9rem;">基础分数</div>
                <div style="font-weight: 500; color: var(--accent);">${system.baseScore}</div>
            </div>
            <div style="margin-bottom: 1rem;">
                <div style="color: var(--gray); font-size: 0.9rem;">活跃度奖励</div>
                <div style="font-weight: 500; color: var(--accent);">+${system.participationBonus || 3}分/场</div>
            </div>
        `;
    },

    renderNextMatch() {
        const container = document.getElementById('nextMatch');
        const nextMatch = this.playersData.nextMatch;
        
        if (nextMatch) {
            container.innerHTML = `
                <div style="text-align: center;">
                    <div style="font-size: 1.1rem; margin-bottom: 0.5rem; color: var(--accent);">${nextMatch.name}</div>
                    <div style="margin-bottom: 1rem; color: var(--gray);">${nextMatch.date} ${nextMatch.time}</div>
                    <div style="background: rgba(255, 255, 255, 0.07); padding: 0.8rem; border-radius: 8px; font-size: 0.9rem;">
                        <div style="margin-bottom: 0.5rem;">曲目: <strong>${nextMatch.song}</strong></div>
                        <div>难度: <strong>${nextMatch.difficulty}</strong></div>
                    </div>
                </div>
            `;
        }
    },

    getHighestScore() {
        if (!this.playersData.players.length) return 0;
        return Math.max(...this.playersData.players.map(p => p.score));
    },

    updateLastUpdated() {
        const element = document.getElementById('lastUpdated');
        if (element && this.playersData.lastUpdated) {
            element.textContent = new Date(this.playersData.lastUpdated).toLocaleString('zh-CN');
        }
    },

    showError(elementId, message) {
        const container = document.getElementById(elementId);
        container.innerHTML = `<div class="error">${message}</div>`;
    },

    renderAll() {
        this.renderLeaderboard();
        this.renderStats();
        this.renderRecentMatches();
        this.renderSystemInfo();
        this.renderNextMatch();
        this.updateLastUpdated();
    }
};