#!/usr/bin/env bash

# ==============================================================================
#             NAHAN GATEWAY PREMIUM INTERACTIVE SETUP WIZARD
# ==============================================================================
# A professional, high-end, highly stylized interactive CLI automation tool
# for provisioning, deploying, and destroying Project Nahan on Cloudflare Edge.
# Includes automatic dependency checks, cross-platform OS package management,
# and high-contrast framed ANSI visual styles with clear menu path routers.
# ==============================================================================

# Custom Color Palette (SenpaiScanner Aesthetic)
NC='\033[0m'
RED='\033[1;31m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
MAGENTA='\033[1;35m'
CYAN='\033[1;36m'
WHITE='\033[1;37m'
BOLD='\033[1m'
DIM='\033[2m'
UNDERLINE='\033[4m'

# Visual Premium Status Indicators
OK="${GREEN}[+]${NC}"
ERR="${RED}[-]${NC}"
WARN="${YELLOW}[!]"
INFO="${CYAN}[i]${NC}"
ASK="${MAGENTA}[?]${NC}"

# Temp files and SIGINT/SIGTERM configuration
trap cleanup EXIT SIGINT SIGTERM
cleanup() {
    rm -f /tmp/nahan_cmd.log
}

# Terminal loading/spinner utility
spinner() {
    local pid=$1
    local delay=0.1
    local spinstr='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
    while kill -0 "$pid" 2>/dev/null; do
        local temp=${spinstr#?}
        printf " ${CYAN}%c${NC}  " "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b\b\b\b"
    done
    printf "    \b\b\b\b"
}

# Process execution with styled feedback
run_with_spinner() {
    local message="$1"
    shift
    echo -ne "$message"
    "$@" > /tmp/nahan_cmd.log 2>&1 &
    local pid=$!
    spinner "$pid"
    wait "$pid"
    local exit_status=$?
    if [ $exit_status -ne 0 ]; then
        echo -e " ${RED}${BOLD}[FAILED]${NC}"
        echo -e "\n${RED}──────────────────── ERROR LOG TRACE ────────────────────${NC}"
        cat /tmp/nahan_cmd.log
        echo -e "${RED}─────────────────────────────────────────────────────────${NC}\n"
        echo -e " ${WARN} Press [Enter] to acknowledge this error and continue..."
        read -r
        return $exit_status
    else
        echo -e " ${GREEN}${BOLD}[SUCCESS]${NC}"
        return 0
    fi
}

# Modern stylized ASCII Art Header
show_header() {
    echo -e "${CYAN}${BOLD}"
    cat << "EOF"
  ███╗   ██╗ █████╗ ██╗  ██╗ █████╗ ██╗   ██╗
  ████╗  ██║██╔══██╗██║  ██║██╔══██╗████╗  ██║
  ██╔██╗ ██║███████║███████║███████║██╔██╗ ██║
  ██║╚██╗██║██╔══██║██╔══██║██╔══██║██║╚██╗██║
  ██║ ╚████║██║  ██║██║  ██║██║  ██║██║ ╚████║
  ╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝
EOF
    echo -e "${NC}"
    echo -e "${CYAN}┌────────────────────────────────────────────────────────────────────────┐${NC}"
    echo -e "${CYAN}│${NC}               ${BOLD}Nahan Edge Gateway Installer — Premium Edition${NC}          ${CYAN}│${NC}"
    echo -e "${CYAN}└────────────────────────────────────────────────────────────────────────┘${NC}"
}

# Native Operating System & Linux Distribution Detection
detect_os() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        OS_NAME="macOS"
        PKG_MANAGER="brew"
    elif [ -f /etc/os-release ]; then
        . /etc/os-release
        case "$ID" in
            ubuntu|debian|mint|pop|raspbian)
                OS_NAME="Debian/Ubuntu/Mint"
                PKG_MANAGER="apt"
                ;;
            arch|manjaro)
                OS_NAME="Arch Linux"
                PKG_MANAGER="pacman"
                ;;
            alpine)
                OS_NAME="Alpine Linux"
                PKG_MANAGER="apk"
                ;;
            fedora|rhel|centos|rocky|almalinux)
                OS_NAME="Fedora/RHEL"
                PKG_MANAGER="dnf"
                ;;
            *)
                if [[ "$ID_LIKE" =~ "debian"|"ubuntu" ]]; then
                    OS_NAME="Debian/Ubuntu/Mint"
                    PKG_MANAGER="apt"
                elif [[ "$ID_LIKE" =~ "arch" ]]; then
                    OS_NAME="Arch Linux"
                    PKG_MANAGER="pacman"
                elif [[ "$ID_LIKE" =~ "rhel"|"fedora"|"centos" ]]; then
                    OS_NAME="Fedora/RHEL"
                    PKG_MANAGER="dnf"
                else
                    OS_NAME="Unknown Linux ($ID)"
                    PKG_MANAGER="unknown"
                fi
                ;;
        esac
    else
        OS_NAME="Unknown"
        PKG_MANAGER="unknown"
    fi
}

# Cross-platform Dependency Handler
check_dependencies() {
    local missing=()
    if ! command -v node &> /dev/null; then
        missing+=("Node.js")
    fi
    if ! command -v npm &> /dev/null; then
        missing+=("npm")
    fi

    if [ ${#missing[@]} -ne 0 ]; then
        detect_os
        # Print a beautiful formatted error box using NodeJS to guarantee perfect alignment
        node -e "
        const items = process.argv[1].split(',');
        const os = process.argv[2];
        const cyan = '\x1b[1;36m';
        const red = '\x1b[1;31m';
        const nc = '\x1b[0m';
        const bold = '\x1b[1m';

        function getWidth(str) {
            const clean = str.replace(/\u001b\[[0-9;]*[a-zA-Z]/g, '');
            let width = 0;
            for (let i = 0; i < clean.length; i++) {
                const code = clean.charCodeAt(i);
                if (code >= 0xd800 && code <= 0xdbff) {
                    width += 2;
                    i++;
                } else if (code > 255) {
                    width += 2;
                } else {
                    width += 1;
                }
            }
            return width;
        }

        function padLine(left, right = '') {
            const contentWidth = 74;
            const padLen = contentWidth - getWidth(left) - getWidth(right);
            return cyan + '│' + nc + ' ' + left + ' '.repeat(Math.max(0, padLen)) + right + ' ' + cyan + '│' + nc;
        }

        console.log(cyan + '┌' + '─'.repeat(76) + '┐' + nc);
        console.log(padLine('⚠️  ' + red + bold + 'MISSING PREREQUISITES DETECTED' + nc));
        console.log(cyan + '├' + '─'.repeat(76) + '┤' + nc);
        console.log(padLine('The installer has identified missing runtime environments:'));
        for (const item of items) {
            console.log(padLine('  • ' + red + item + nc));
        }
        console.log(padLine(''));
        console.log(padLine('Platform Auto-detected: ' + bold + cyan + os + nc));
        console.log(cyan + '└' + '─'.repeat(76) + '┘' + nc);
        " "${missing[*]}" "$OS_NAME"
        echo ""

        if [ "$PKG_MANAGER" = "unknown" ]; then
            echo -e " ${ERR} Automatic installer package execution is not mapped for this OS."
            echo -e " ${INFO} Please install Node.js & npm manually on your platform, then re-run."
            exit 1
        fi

        echo -e " ${ASK} Would you like this installer to download the missing packages? (y/n)"
        read -p " ❯ " answer
        if [[ "$answer" =~ ^[Yy]$ ]]; then
            echo -e " ${INFO} Preparing auto-installation via native package manager: ${BOLD}${CYAN}${PKG_MANAGER}${NC}..."
            
            local cmd_prefix=""
            if [ "$EUID" -ne 0 ] && command -v sudo &> /dev/null; then
                cmd_prefix="sudo "
            fi

            case "$PKG_MANAGER" in
                apt)
                    echo -e " ${INFO} Launching apt-get installation cycle..."
                    $cmd_prefix apt-get update && $cmd_prefix apt-get install -y nodejs npm build-essential
                    ;;
                pacman)
                    echo -e " ${INFO} Launching pacman installation cycle..."
                    $cmd_prefix pacman -Syu --noconfirm nodejs npm base-devel
                    ;;
                apk)
                    echo -e " ${INFO} Launching apk installation cycle..."
                    $cmd_prefix apk add --no-cache nodejs npm build-base
                    ;;
                dnf)
                    echo -e " ${INFO} Launching dnf installation cycle..."
                    $cmd_prefix dnf install -y nodejs npm @development-tools
                    ;;
                brew)
                    echo -e " ${INFO} Launching brew installation cycle..."
                    brew install node
                    ;;
            esac

            # Re-verify installation status
            if command -v node &> /dev/null && command -v npm &> /dev/null; then
                echo -e " ${OK} Dependencies satisfied successfully!"
                sleep 2
            else
                echo -e " ${ERR} Installation completed but binaries could not be located in standard paths."
                echo -e " ${INFO} Please review logs and complete Node.js/npm configuration manually."
                exit 1
            fi
        else
            echo -e " ${ERR} Execution aborted. Node.js and npm are strictly required to compile resources."
            exit 1
        fi
    else
        echo -e "  ${OK} Node.js & npm runtime packages are verified."
    fi
}

# Verification of Wrangler deployment engine
check_wrangler() {
    WRANGLER_FOUND=false
    if command -v wrangler &> /dev/null; then
        WRANGLER_VERSION=$(wrangler --version 2>/dev/null)
        echo -e "  ${OK} Wrangler Engine (Global) is active: ${CYAN}v$WRANGLER_VERSION${NC}"
        WRANGLER_FOUND=true
    elif [ -f "./node_modules/.bin/wrangler" ]; then
        WRANGLER_VERSION=$(npx wrangler --version 2>/dev/null)
        echo -e "  ${OK} Wrangler Engine (Local Node Bindings) is active: ${CYAN}v$WRANGLER_VERSION${NC}"
        WRANGLER_FOUND=true
    else
        echo -e "  ${WARN} Wrangler deployment utility was not detected."
        echo -e " ┌────────────────────────────────────────────────────────┐"
        echo -e " │ wrangler CLI tool is required to upload files to Edge.│"
        echo -e " └────────────────────────────────────────────────────────┘"
        echo -e " ${ASK} Install Wrangler globally now? (Y/n)"
        read -p " ❯ " install_wrangler
        install_wrangler=${install_wrangler:-Y}
        if [[ "$install_wrangler" =~ ^[Yy]$ ]]; then
             echo -e " ${INFO} Running global installation of Wrangler via npm..."
             
             local cmd_prefix=""
             if [ "$EUID" -ne 0 ] && command -v sudo &> /dev/null; then
                 cmd_prefix="sudo "
             fi

             if ${cmd_prefix}npm install -g wrangler; then
                 echo -e "  ${OK} Wrangler CLI is now installed and loaded!"
                 WRANGLER_FOUND=true
             else
                 echo -e "  ${ERR} Global deployment failed. Defaulting to on-the-fly execution via npx."
             fi
        else
             echo -e " ${INFO} Running deployment scripts on-the-fly via npx wrappers."
        fi
    fi
}

# ==============================================================================
#                 INSTALLATION & DEPLOYMENT ROUTINE
# ==============================================================================
install_nahan() {
    # ─── PHASE 1 ───
    clear
    show_header
    echo -e "\n${BOLD}${MAGENTA}─── [ PHASE 1 ] ENGINE & PREREQUISITE VALIDATION ───${NC}\n"
    check_dependencies
    check_wrangler
    echo -e "\n ${OK} Phase 1 complete! Press [Enter] to continue to Cloudflare Login..."
    read -r

    # ─── PHASE 2 ───
    clear
    show_header
    echo -e "\n${BOLD}${MAGENTA}─── [ PHASE 2 ] CLOUDFLARE SSO AUTHENTICATION ───${NC}\n"
    echo -e "┌────────────────────────────────────────────────────────────────────────┐"
    echo -e "│  ${WARN}  ${YELLOW}${BOLD}SSO HANDSHAKE NETWORK WARNING${NC}                                        │"
    echo -e "├────────────────────────────────────────────────────────────────────────┤"
    echo -e "│  Any active VPN structures, private routing tunnels, or localized      │"
    echo -e "│  firewalls can disrupt secure browser redirection handshakes.          │"
    echo -e "│                                                                        │"
    echo -e "│  ${BOLD}We strongly advise pausing VPN clients before authenticating.${NC}       │"
    echo -e "└────────────────────────────────────────────────────────────────────────┘"
    echo ""
    echo -e " ${ASK} Press [Enter] to launch your default browser and sign in..."
    read -r

    npx wrangler login

    echo -e "\n ${OK} Cloudflare Authentication established. Press [Enter] to provision D1 DB..."
    read -r

    # ─── PHASE 3 ───
    clear
    show_header
    echo -e "\n${BOLD}${MAGENTA}─── [ PHASE 3 ] EDGE DATABASE PROVISIONING ───${NC}\n"
    echo -e " ${ASK} Define a label for your Cloudflare D1 Database [Default: iot_db]: "
    read -p " ❯ " DB_NAME
    DB_NAME=${DB_NAME:-iot_db}

    D1_OUTPUT=""
    DB_ID=""

    echo ""
    if run_with_spinner " ${INFO} Requesting Cloudflare API to provision D1 Database '$DB_NAME'..." npx wrangler d1 create "$DB_NAME"; then
        D1_OUTPUT=$(cat /tmp/nahan_cmd.log)
        DB_ID=$(echo "$D1_OUTPUT" | grep -oE "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}" | head -n1)
    else
        D1_OUTPUT=$(cat /tmp/nahan_cmd.log)
        # Handle pre-existing database scenarios
        if echo "$D1_OUTPUT" | grep -qE "already exists|already_exists" 2>/dev/null; then
            echo -e " ${WARN} The database name '${CYAN}$DB_NAME${NC}' already exists in your Cloudflare account."
            
            if run_with_spinner " ${INFO} Retrieving available D1 database details..." npx wrangler d1 list --json; then
                D1_LIST_OUTPUT=$(cat /tmp/nahan_cmd.log)
                
                # Use Node engine to parse JSON precisely and guarantee robust extraction
                DB_ID=$(node -e "
                try {
                    const dbs = JSON.parse(process.argv[1]);
                    const db = dbs.find(d => d.name === process.argv[2]);
                    if (db) {
                        console.log(db.uuid || db.database_id || '');
                        process.exit(0);
                    }
                } catch (e) {}
                process.exit(1);
                " "$D1_LIST_OUTPUT" "$DB_NAME" 2>/dev/null)

                # Inline backup regex parser
                if [ -z "$DB_ID" ]; then
                    DB_ID=$(echo "$D1_LIST_OUTPUT" | grep -A 4 -B 4 "$DB_NAME" | grep -oE "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}" | head -n1)
                fi
            fi
        fi
    fi

    # Manual Fallback for UUID Assignment
    if [ -z "$DB_ID" ]; then
        echo -e "\n ${WARN} Unable to automatically parse the Database UUID."
        while [ -z "$DB_ID" ]; do
            echo -e " ${ASK} Please paste your D1 Database ID (UUID format) manually:"
            read -p " ❯ " DB_ID
            if [[ ! "$DB_ID" =~ ^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$ ]]; then
                echo -e " ${ERR} ${RED}Error: String is not a valid UUID format. Please try again.${NC}"
                DB_ID=""
            fi
        done
    else
        echo -e " ${OK} Database ID mapped successfully: ${BOLD}${CYAN}$DB_ID${NC}"
    fi

    echo -e "\n ${OK} Phase 3 complete! Press [Enter] to generate runtime configurations..."
    read -r

    # ─── PHASE 4 ───
    clear
    show_header
    echo -e "\n${BOLD}${MAGENTA}─── [ PHASE 4 ] COMPILED SPECIFICATION GENERATION ───${NC}\n"
    echo -e " ${ASK} Define a name for your Cloudflare Edge Worker [Default: nahan-core]: "
    read -p " ❯ " WORKER_NAME
    WORKER_NAME=${WORKER_NAME:-nahan-core}

    echo -e "\n ${INFO} Formatting environment specifications..."
    echo -e "     • Core Instance Name : ${CYAN}$WORKER_NAME${NC}"
    echo -e "     • Target SQLite DB   : ${CYAN}$DB_NAME${NC}"
    echo -e "     • Persistent ID Map  : ${CYAN}$DB_ID${NC}"
    echo -e "     • Driver Binding     : ${BOLD}${GREEN}IOT_DB${NC}"
    echo ""

    # Write wrangler.toml to project directory
    cat <<EOF > wrangler.toml
# Production wrangler.toml compiled automatically by Nahan Setup Script
name = "$WORKER_NAME"
main = "src/index.js"
compatibility_date = "2024-03-01"

[dev]
port = 8787

[[d1_databases]]
binding = "IOT_DB"
database_name = "$DB_NAME"
database_id = "$DB_ID"
EOF

    echo -e " ${OK} Successfully wrote ${BOLD}wrangler.toml${NC} configuration specs to disk."
    echo -e "\n ${OK} Phase 4 complete! Press [Enter] to initiate edge deployment..."
    read -r

    # ─── PHASE 5 ───
    clear
    show_header
    echo -e "\n${BOLD}${MAGENTA}─── [ PHASE 5 ] CLOUDFLARE EDGE NETWORK DEPLOYMENT ───${NC}\n"

    DEPLOY_OUTPUT=""
    DEPLOY_URL=""

    if [ -f "scripts/build.js" ]; then
        run_with_spinner " ${INFO} Compiling modular src/ codebase into _worker.js bundle..." node scripts/build.js
    fi

    if run_with_spinner " ${INFO} Uploading scripts, linking bindings, and activating Edge nodes..." npx wrangler deploy; then
        DEPLOY_OUTPUT=$(cat /tmp/nahan_cmd.log)
        DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -oE "https://[a-zA-Z0-9._-]+\.workers\.dev" | head -n1)
    else
        echo -e "\n ${ERR} Deployment encountered an execution error."
        echo -e " ${INFO} Press [Enter] to return to the main menu..."
        read -r
        return 1
    fi

    # Manual worker URL resolution
    if [ -z "$DEPLOY_URL" ]; then
        echo -e "\n ${WARN} Script compiled successfully, but deployment URL was not output by Wrangler."
        echo -e " ${ASK} Please enter your Worker Domain manually (e.g. nahan.username.workers.dev):"
        read -p " ❯ " USER_URL
        if [[ ! "$USER_URL" =~ ^https:// ]]; then
            DEPLOY_URL="https://$USER_URL"
        else
            DEPLOY_URL="$USER_URL"
        fi
    fi

    DEPLOY_URL=$(echo "$DEPLOY_URL" | sed 's/\/$//')

    echo -e "\n ${OK} Deployment finalized successfully!"
    echo -e " ${OK} Press [Enter] to access the Nahan Control Dashboard..."
    read -r

    # ─── PHASE 6 ───
    clear
    echo -e "${GREEN}${BOLD}"
    cat << "EOF"
  ███╗   ██╗ █████╗ ██╗  ██╗ █████╗ ██╗   ██╗
  ████╗  ██║██╔══██╗██║  ██║██╔══██╗████╗  ██║
  ██╔██╗ ██║███████║███████║███████║██╔██╗ ██║
  ██║╚██╗██║██╔══██║██╔══██║██╔══██║██║╚██╗██║
  ██║ ╚████║██║  ██║██║  ██║██║  ██║██║ ╚████║
  ╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝
EOF
    echo -e "${NC}"

    # Render pixel-perfect success dashboard using NodeJS formatting engine to avoid broken borders
    node -e "
    const workerUrl = process.argv[1];
    const dbName = process.argv[2];
    const dbUuid = process.argv[3];
    const workerName = process.argv[4];

    function getWidth(str) {
        const clean = str.replace(/\u001b\[[0-9;]*[a-zA-Z]/g, '');
        let width = 0;
        for (let i = 0; i < clean.length; i++) {
            const code = clean.charCodeAt(i);
            if (code >= 0xd800 && code <= 0xdbff) {
                width += 2;
                i++;
            } else if (code > 255) {
                width += 2;
            } else {
                width += 1;
            }
        }
        return width;
    }

    function padLine(leftText, rightText = '', padChar = ' ') {
        const contentWidth = 74;
        const leftWidth = getWidth(leftText);
        const rightWidth = getWidth(rightText);
        const padLen = contentWidth - leftWidth - rightWidth;
        return '\x1b[1;36m│\x1b[0m ' + leftText + padChar.repeat(Math.max(0, padLen)) + rightText + ' \x1b[1;36m│\x1b[0m';
    }

    const cyan = '\x1b[1;36m';
    const green = '\x1b[1;32m';
    const blue = '\x1b[1;34m';
    const yellow = '\x1b[1;33m';
    const red = '\x1b[1;31m';
    const bold = '\x1b[1m';
    const nc = '\x1b[0m';

    console.log(cyan + '┌' + '─'.repeat(76) + '┐' + nc);
    console.log(padLine('          🚀   CONGRATULATIONS! NAHAN EDGE GATEWAY IS ONLINE!   🚀        '));
    console.log(cyan + '├' + '─'.repeat(76) + '┤' + nc);
    console.log(padLine(green + '[+]' + nc + ' Dependencies Verified'));
    console.log(padLine(green + '[+]' + nc + ' Secure SSO Authentication Completed'));
    console.log(padLine(green + '[+]' + nc + ' D1 Database Initialized: ' + blue + dbName + nc));
    console.log(padLine(green + '[+]' + nc + ' D1 Database Bound: ' + blue + dbUuid + nc));
    console.log(padLine(green + '[+]' + nc + ' Production Configuration Generated: wrangler.toml'));
    console.log(padLine(green + '[+]' + nc + ' Worker Node Activated: ' + blue + workerName + nc));
    console.log(cyan + '├' + '─'.repeat(76) + '┤' + nc);
    console.log(padLine('🖥️  DIRECT MANAGEMENT DASHBOARD ENDPOINT:'));
    console.log(padLine('   👉 \x1b[4m\x1b[1;36m' + workerUrl + '/sync/dash' + nc));
    console.log(cyan + '├' + '─'.repeat(76) + '┤' + nc);
    console.log(padLine(yellow + '⚠️  CRITICAL SECURITY SYSTEM METRICS:' + nc));
    console.log(padLine('   • Default Authentication Key : ' + red + bold + 'admin' + nc));
    console.log(padLine('   • Status Code                : ' + green + '200 OK' + nc));
    console.log(padLine(''));
    console.log(padLine(bold + 'ACTION REQUIRED:' + nc + ' You must immediately navigate to the System tab'));
    console.log(padLine('in the dashboard to alter your Master Key and secure the dashboard'));
    console.log(padLine('API route parameter to seal authorization!'));
    console.log(cyan + '└' + '─'.repeat(76) + '┘' + nc);
    " "$DEPLOY_URL" "$DB_NAME" "$DB_ID" "$WORKER_NAME"

    echo ""
    echo -e " Press [Enter] to return to the main menu..."
    read -r
}

# ==============================================================================
#                 UNINSTALLATION & TEARDOWN ROUTINE
# ==============================================================================
uninstall_nahan() {
    clear
    show_header
    echo -e "\n${BOLD}${RED}─── [ DESTRUCTION WIZARD ] REMOVE NAHAN FROM CLOUDFLARE ───${NC}\n"

    # Render Destruction warning box beautifully via Node
    node -e "
    const cyan = '\x1b[1;36m';
    const red = '\x1b[1;31m';
    const bold = '\x1b[1m';
    const nc = '\x1b[0m';

    function getWidth(str) {
        const clean = str.replace(/\u001b\[[0-9;]*[a-zA-Z]/g, '');
        let width = 0;
        for (let i = 0; i < clean.length; i++) {
            const code = clean.charCodeAt(i);
            if (code >= 0xd800 && code <= 0xdbff) {
                width += 2;
                i++;
            } else if (code > 255) {
                width += 2;
            } else {
                width += 1;
            }
        }
        return width;
    }

    function padLine(left, right = '') {
        const contentWidth = 74;
        const padLen = contentWidth - getWidth(left) - getWidth(right);
        return cyan + '│' + nc + ' ' + left + ' '.repeat(Math.max(0, padLen)) + right + ' ' + cyan + '│' + nc;
    }

    console.log(cyan + '┌' + '─'.repeat(76) + '┐' + nc);
    console.log(padLine('⚠️  ' + red + bold + 'WARNING: PERMANENT WIPE DESTRUCTION ACTION' + nc));
    console.log(cyan + '├' + '─'.repeat(76) + '┤' + nc);
    console.log(padLine('This wizard will permanently tear down your Nahan Worker, drop the'));
    console.log(padLine('D1 SQLite Database, delete all user traffic quotas, and delete the'));
    console.log(padLine('local wrangler.toml file from this directory.'));
    console.log(padLine(''));
    console.log(padLine(red + bold + 'THIS IS IRREVERSIBLE AND CANNOT BE UNDONE!' + nc));
    console.log(cyan + '└' + '─'.repeat(76) + '┘' + nc);
    "
    echo ""

    echo -e " ${ASK} Are you absolutely sure you want to completely wipe Nahan from Cloudflare? (y/n)"
    read -p " ❯ " double_confirm_1
    if [[ ! "$double_confirm_1" =~ ^[Yy]$ ]]; then
        echo -e "\n ${OK} Uninstall cancelled. Returning to main menu..."
        sleep 2
        return
    fi

    echo -e " ${ASK} Please type 'DESTROY' in all caps to confirm permanent deletion: "
    read -p " ❯ " double_confirm_2
    if [ "$double_confirm_2" != "DESTROY" ]; then
        echo -e "\n ${ERR} Typing verification failed. Returning to main menu..."
        sleep 2
        return
    fi

    echo -e "\n ${INFO} Parsing local directories to resolve deployment records..."
    
    # Load local parameters from file if available
    WORKER_NAME=""
    DB_NAME=""
    if [ -f "wrangler.toml" ]; then
        WORKER_NAME=$(grep -E '^\s*name\s*=' wrangler.toml | head -n1 | sed -E 's/[^"=]*=\s*["'\'']?([^"'\'']*)["'\'']?/\1/' | xargs 2>/dev/null)
        DB_NAME=$(grep -E '^\s*database_name\s*=' wrangler.toml | head -n1 | sed -E 's/[^"=]*=\s*["'\'']?([^"'\'']*)["'\'']?/\1/' | xargs 2>/dev/null)
    fi

    if [ -z "$WORKER_NAME" ]; then
        echo -e " ${WARN} Could not locate Worker Name in wrangler.toml."
        echo -e " ${ASK} Please input the Cloudflare Worker name to destroy [Default: nahan-core]:"
        read -p " ❯ " WORKER_NAME
        WORKER_NAME=${WORKER_NAME:-nahan-core}
    else
        echo -e "  ${OK} Detected Worker: ${CYAN}$WORKER_NAME${NC}"
    fi

    if [ -z "$DB_NAME" ]; then
        echo -e " ${WARN} Could not locate D1 Database Name in wrangler.toml."
        echo -e " ${ASK} Please input the Cloudflare D1 Database name to destroy [Default: iot_db]:"
        read -p " ❯ " DB_NAME
        DB_NAME=${DB_NAME:-iot_db}
    else
        echo -e "  ${OK} Detected Database: ${CYAN}$DB_NAME${NC}"
    fi

    # Require Cloudflare credentials check
    echo -e "\n ${INFO} Checking credentials. Let's make sure you are logged in to Cloudflare..."
    npx wrangler login

    echo -e "\n${BOLD}${RED}─── INITIATING TEARDOWN SEQUENCE ───${NC}\n"

    # Worker Deletion execution
    local worker_deleted=false
    if [ -f "wrangler.toml" ]; then
        if run_with_spinner " ${INFO} Tearing down Cloudflare Edge Worker '$WORKER_NAME'..." npx wrangler delete; then
            worker_deleted=true
        fi
    else
        if run_with_spinner " ${INFO} Tearing down Cloudflare Edge Worker '$WORKER_NAME'..." npx wrangler delete --name "$WORKER_NAME"; then
            worker_deleted=true
        fi
    fi

    # Database deletion execution with explicit confirmation checks
    local db_deleted=false
    if run_with_spinner " ${INFO} Dropping remote D1 database storage space '$DB_NAME'..." npx wrangler d1 delete "$DB_NAME" -y; then
        db_deleted=true
    else
        echo -e "\n ${ERR} Could not automatically drop D1 Database '$DB_NAME' via CLI."
        echo -e " ${WARN} This usually happens if the database was already deleted or doesn't exist."
        echo -e " ${INFO} Press [Enter] to acknowledge this status and continue..."
        read -r
    fi

    # Remove wrangler.toml configuration file from local workspace
    local toml_removed=false
    if [ -f "wrangler.toml" ]; then
        echo -ne " ${INFO} Removing local wrangler.toml configuration..."
        if rm -f wrangler.toml; then
            toml_removed=true
            echo -e " ${GREEN}[REMOVED]${NC}"
        else
            echo -e " ${RED}[FAILED]${NC}"
        fi
    fi

    # Final Deletion Summary Screen
    clear
    echo -e "${RED}${BOLD}"
    cat << "EOF"
 ██╗   ██╗███╗   ██╗██╗███╗   ██╗███████╗████████╗ █████╗ ██╗     ██╗     
 ██║   ██║████╗  ██║██║████╗  ██║██╔════╝╚══██╔══╝██╔══██╗██║     ██║     
 ██║   ██║██╔██╗ ██║██║██╔██╗ ██║███████╗   ██║   ███████║██║     ██║     
 ██║   ██║██║╚██╗██║██║██║╚██╗██║╚════██║   ██║   ██╔══██║██║     ██║     
 ╚██████╔╝██║ ╚████║██║██║ ╚████║███████║   ██║   ██║  ██║███████╗███████╗
  ╚═════╝ ╚═╝  ╚═══╝╚═╝╚═╝  ╚═══╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚══════╝
EOF
    echo -e "${NC}"

    # Render perfect removal success box via Node
    node -e "
    const workerName = process.argv[1];
    const dbName = process.argv[2];
    const workerDel = process.argv[3] === 'true';
    const dbDel = process.argv[4] === 'true';
    const tomlDel = process.argv[5] === 'true';

    const cyan = '\x1b[1;36m';
    const red = '\x1b[1;31m';
    const green = '\x1b[1;32m';
    const bold = '\x1b[1m';
    const nc = '\x1b[0m';

    function getWidth(str) {
        const clean = str.replace(/\u001b\[[0-9;]*[a-zA-Z]/g, '');
        let width = 0;
        for (let i = 0; i < clean.length; i++) {
            const code = clean.charCodeAt(i);
            if (code >= 0xd800 && code <= 0xdbff) {
                width += 2;
                i++;
            } else if (code > 255) {
                width += 2;
            } else {
                width += 1;
            }
        }
        return width;
    }

    function padLine(left, right = '') {
        const contentWidth = 74;
        const padLen = contentWidth - getWidth(left) - getWidth(right);
        return cyan + '│' + nc + ' ' + left + ' '.repeat(Math.max(0, padLen)) + right + ' ' + cyan + '│' + nc;
    }

    console.log(cyan + '┌' + '─'.repeat(76) + '┐' + nc);
    console.log(padLine('💥  ' + red + bold + 'NAHAN UNINSTALLATION OPERATIONS SUMMARY' + nc));
    console.log(cyan + '├' + '─'.repeat(76) + '┤' + nc);
    console.log(padLine(
        (workerDel ? red + '[-] ' + nc : '\x1b[1;33m[!] ' + nc) +
        'Cloudflare Worker Node \x1b[1;34m' + workerName + '\x1b[0m: ' + (workerDel ? red + 'DELETED' : '\x1b[1;33mNOT REMOVED/NOT FOUND') + nc
    ));
    console.log(padLine(
        (dbDel ? red + '[-] ' + nc : '\x1b[1;33m[!] ' + nc) +
        'D1 Database Storage \x1b[1;34m' + dbName + '\x1b[0m: ' + (dbDel ? red + 'DELETED' : '\x1b[1;33mNOT REMOVED/NOT FOUND') + nc
    ));
    console.log(padLine(
        (tomlDel ? red + '[-] ' + nc : '\x1b[1;33m[!] ' + nc) +
        'Local configuration file wrangler.toml: ' + (tomlDel ? red + 'DELETED' : '\x1b[1;33mNOT FOUND') + nc
    ));
    console.log(cyan + '├' + '─'.repeat(76) + '┤' + nc);
    console.log(padLine(green + '[+] ' + nc + 'Cleanup operation completed successfully.'));
    console.log(cyan + '└' + '─'.repeat(76) + '┘' + nc);
    " "$WORKER_NAME" "$DB_NAME" "$worker_deleted" "$db_deleted" "$toml_removed"

    echo ""
    echo -e " Press [Enter] to return to the main menu..."
    read -r
}

# ==============================================================================
#                 CENTRALIZED CONTROL PORTAL LOOP
# ==============================================================================
main_menu() {
    while true; do
        clear
        show_header
        echo -e "\n${BOLD}${CYAN}─── [ SYSTEM ACTION PORTAL ] ───${NC}\n"
        
        # Render clean centered selection box using NodeJS layout generator
        node -e "
        const cyan = '\x1b[1;36m';
        const green = '\x1b[1;32m';
        const red = '\x1b[1;31m';
        const yellow = '\x1b[1;33m';
        const magenta = '\x1b[1;35m';
        const bold = '\x1b[1m';
        const nc = '\x1b[0m';

        function getWidth(str) {
            const clean = str.replace(/\u001b\[[0-9;]*[a-zA-Z]/g, '');
            let width = 0;
            for (let i = 0; i < clean.length; i++) {
                const code = clean.charCodeAt(i);
                if (code >= 0xd800 && code <= 0xdbff) {
                    width += 2;
                    i++;
                } else if (code > 255) {
                    width += 2;
                } else {
                    width += 1;
                }
            }
            return width;
        }

        function padLine(left, right = '') {
            const contentWidth = 74;
            const padLen = contentWidth - getWidth(left) - getWidth(right);
            return cyan + '│' + nc + ' ' + left + ' '.repeat(Math.max(0, padLen)) + right + ' ' + cyan + '│' + nc;
        }

        console.log(cyan + '┌' + '─'.repeat(76) + '┐' + nc);
        console.log(padLine(magenta + '[?]' + nc + ' ' + bold + 'SELECT SETUP ROUTE:' + nc));
        console.log(cyan + '├' + '─'.repeat(76) + '┤' + nc);
        console.log(padLine(''));
        console.log(padLine('  ' + green + '1)' + nc + '  🚀  Interactive Wrangler Installer (Recommended)'));
        console.log(padLine('  ' + cyan + '2)' + nc + '  🌐  Launch Web Installer (Local Browser UI)'));
        console.log(padLine('  ' + yellow + '3)' + nc + '  ⚡  Compile & Bundle Modular Worker (src/ -> _worker.js)'));
        console.log(padLine('  ' + red + '4)' + nc + '  💀  Uninstall / Wipe Nahan Project from Cloudflare'));
        console.log(padLine('  ' + magenta + '5)' + nc + '  🚪  Exit Setup Wizard'));
        console.log(padLine(''));
        console.log(cyan + '└' + '─'.repeat(76) + '┘' + nc);
        "
        echo ""
        echo -e " ${ASK} Enter choice [1-5]:"
        read -p " ❯ " choice
        case "$choice" in
            1)
                node installer/cli.js || install_nahan
                ;;
            2)
                clear
                echo -e "\n ${OK} Starting Nahan Web Installer on port 3000..."
                echo -e " ${INFO} Open your browser at: ${BOLD}${CYAN}http://localhost:3000/${NC}"
                echo -e " ${WARN} Press [Ctrl+C] to stop the server when done.\n"
                node server.js
                ;;
            3)
                clear
                echo -e "\n ${INFO} Compiling modular src/ into _worker.js..."
                node scripts/build.js
                echo -e "\n Press [Enter] to continue..."
                read -r
                ;;
            4)
                uninstall_nahan
                ;;
            5)
                clear
                echo -e "\n ${OK} Thank you for using Nahan Gateway Installer. Safe travels! 👋\n"
                exit 0
                ;;
            *)
                echo -e "\n ${ERR} Invalid option selected. Please use [1-5]."
                sleep 1.5
                ;;
        esac
    done
}

# Start the installer
main_menu
