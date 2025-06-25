/**
 * ArcSight Troubleshooting Guide - Data
 * Contains all the troubleshooting sections, commands, and patterns
 */

// Get sections data
function getSectionsData() {
    return [
        {
            id: 'health',
            title: '❤️ System Health Checks',
            commandGroups: [
                {
                    title: 'Overall System Status',
                    commands: [
                        {
                            command: 'kubectl cluster-info',
                            description: 'Shows Kubernetes master and DNS service status',
                            usage: 'Use as the first command when starting troubleshooting'
                        },
                        {
                            command: 'kubectl get componentstatuses',
                            description: 'Shows health of core Kubernetes components'
                        },
                        {
                            command: 'kubectl get nodes -o wide',
                            description: 'Shows all cluster nodes with detailed information (IP, OS, kernel version)'
                        },
                        {
                            command: 'kubectl top nodes',
                            description: 'Shows CPU and memory usage per node',
                            usage: 'Use when system performance is slow or unresponsive'
                        }
                    ]
                },
                {
                    title: 'ArcSight Core Components',
                    commands: [
                        {
                            command: 'kubectl get pods -n core -o wide',
                            description: 'Shows all pods in core namespace with node placement'
                        },
                        {
                            command: 'kubectl get pods -n core --show-labels',
                            description: 'Shows pod labels for component identification'
                        },
                        {
                            command: 'kubectl get deployments,statefulsets,daemonsets -n core',
                            description: 'Shows all workload resources and their current status'
                        },
                        {
                            type: 'multi',
                            command: `# Complete system health overview
kubectl get all -n core
kubectl get pv,pvc -n core
kubectl get configmaps,secrets -n core | wc -l
kubectl get ingress -n core`,
                            description: 'Comprehensive overview of all system components'
                        }
                    ]
                },
                {
                    title: 'Service Health Monitoring',
                    commands: [
                        {
                            command: 'kubectl get svc -n core',
                            description: 'Shows all services and their endpoint configurations'
                        },
                        {
                            command: 'kubectl get endpoints -n core',
                            description: 'Shows service endpoint mappings to backing pods',
                            usage: 'Critical when services exist but can\'t reach pods'
                        },
                        {
                            type: 'multi',
                            command: `# Service connectivity verification
for svc in $(kubectl get svc -n core -o jsonpath='{.items[*].metadata.name}'); do
  echo "=== Checking service: $svc ==="
  kubectl get endpoints $svc -n core
  kubectl describe svc $svc -n core | grep -A 3 "Endpoints"
done`,
                            description: 'Automated check of all service endpoints and their backing pods'
                        }
                    ]
                }
            ]
        },
        {
            id: 'auth',
            title: '🔐 Authentication & JWT Issues',
            commandGroups: [
                {
                    title: 'JWT Token Diagnostics',
                    commands: [
                        {
                            command: 'kubectl logs -n core $(kubectl get pods -n core | grep cdf-apiserver | awk \'{print $1}\') | grep -i jwt',
                            description: 'Shows all JWT-related log entries from the API server',
                            usage: 'Primary command for 403 Forbidden and authentication errors'
                        },
                        {
                            command: 'kubectl logs -n core $(kubectl get pods -n core | grep cdf-apiserver | awk \'{print $1}\') | grep "JWT expired"',
                            description: 'Filters for expired JWT token messages specifically'
                        },
                        {
                            command: 'kubectl logs -n core $(kubectl get pods -n core | grep cdf-apiserver | awk \'{print $1}\') | grep "ForbiddenException"',
                            description: 'Shows forbidden access attempts and permission denials'
                        },
                        {
                            command: 'kubectl logs -n core $(kubectl get pods -n core | grep cdf-apiserver | awk \'{print $1}\') | grep -C 5 "403"',
                            description: 'Shows 403 errors with 5 lines of context before and after'
                        }
                    ]
                },
                {
                    title: 'Authentication Testing',
                    commands: [
                        {
                            command: 'curl -k -I https://d1-spv-host05.domain.ent/urest/v1.1/deployment',
                            description: 'Test API endpoint accessibility bypassing browser issues',
                            usage: 'Essential for isolating browser vs backend API issues'
                        },
                        {
                            command: 'curl -k -v https://d1-spv-host05.domain.ent/urest/v1.1/config?updatedOn=DEPLOYED&hasValue=true',
                            description: 'Tests the configuration endpoint that commonly fails'
                        },
                        {
                            command: 'curl -k -H "Accept: application/json" https://d1-spv-host05.domain.ent/urest/v1.1/health',
                            description: 'Basic connectivity test to health endpoint'
                        },
                        {
                            type: 'multi',
                            command: `# Complete API endpoint testing suite
endpoints=(
  "/urest/v1.1/health"
  "/urest/v1.1/deployment" 
  "/urest/v1.1/config?updatedOn=DEPLOYED&hasValue=true"
  "/static/css/"
  "/static/js/"
)

for endpoint in "\${endpoints[@]}"; do
  echo "Testing: $endpoint"
  response=$(curl -k -s -o /dev/null -w "%{http_code}" "https://d1-spv-host05.domain.ent$endpoint")
  echo "Response: $response"
  echo "---"
done`,
                            description: 'Automated testing of all critical API endpoints with response codes'
                        }
                    ]
                },
                {
                    title: 'Token Cache Management',
                    commands: [
                        {
                            command: 'kubectl exec -n core $(kubectl get pods -n core | grep cdf-apiserver | awk \'{print $1}\') -- find /tmp -name "*token*" -type f',
                            description: 'Locate token cache files in the API server pod'
                        },
                        {
                            command: 'kubectl exec -n core $(kubectl get pods -n core | grep cdf-apiserver | awk \'{print $1}\') -- rm -rf /tmp/token-cache/*',
                            description: 'Clear server-side token cache',
                            warning: 'This forces all users to re-authenticate immediately'
                        },
                        {
                            command: 'kubectl delete pod -n core $(kubectl get pods -n core | grep cdf-apiserver | awk \'{print $1}\')',
                            description: 'Restart API server pod to clear in-memory token cache'
                        },
                        {
                            type: 'multi',
                            command: `# Complete token cleanup and restart procedure
api_pod=$(kubectl get pods -n core | grep cdf-apiserver | awk '{print $1}')
echo "Clearing token cache in pod: $api_pod"

kubectl exec -n core $api_pod -- rm -rf /tmp/token-cache/*
kubectl delete pod -n core $api_pod

echo "Waiting for pod restart..."
sleep 30

kubectl get pods -n core | grep cdf-apiserver
echo "Token cleanup completed"`,
                            description: 'Full automated token cache reset with pod restart and verification'
                        }
                    ]
                }
            ]
        },
        {
            id: 'pods',
            title: '🔄 Pod Management & Lifecycle',
            commandGroups: [
                {
                    title: 'Pod Status Analysis',
                    commands: [
                        {
                            command: 'kubectl get pods -n core --sort-by=.metadata.creationTimestamp',
                            description: 'Shows pods sorted by creation time (oldest first)'
                        },
                        {
                            command: 'kubectl get pods -n core | grep -v Running',
                            description: 'Shows only problematic pods for quick identification',
                            usage: 'Essential first step in pod troubleshooting'
                        },
                        {
                            command: 'kubectl get pods -n core -o custom-columns="NAME:.metadata.name,STATUS:.status.phase,RESTARTS:.status.containerStatuses[0].restartCount,AGE:.metadata.creationTimestamp"',
                            description: 'Shows pod names, status, restart counts, and creation time'
                        },
                        {
                            command: 'kubectl describe pod $(kubectl get pods -n core | grep -v Running | head -1 | awk \'{print $1}\') -n core',
                            description: 'Shows detailed information about the first problematic pod'
                        }
                    ]
                },
                {
                    title: 'Pod Recovery',
                    commands: [
                        {
                            command: 'kubectl delete pod $(kubectl get pods -n core | grep CrashLoopBackOff | awk \'{print $1}\') -n core',
                            description: 'Restart all pods in CrashLoopBackOff state'
                        },
                        {
                            command: 'kubectl rollout restart deployment -n core cdf-apiserver',
                            description: 'Graceful restart of API server deployment'
                        },
                        {
                            type: 'multi',
                            command: `# Rolling restart of all deployments
for deploy in $(kubectl get deploy -n core -o name); do
  echo "Restarting $deploy"
  kubectl rollout restart $deploy -n core
  kubectl rollout status $deploy -n core --timeout=300s
  echo "---"
done`,
                            description: 'Restart all deployments with status monitoring and timeout',
                            warning: 'Causes brief service interruptions during rolling updates'
                        }
                    ]
                }
            ]
        },
        {
            id: 'services',
            title: '🌐 Services & Network Troubleshooting',
            commandGroups: [
                {
                    title: 'Service Discovery & Status',
                    commands: [
                        {
                            command: 'kubectl get services -n core -o wide',
                            description: 'Shows all services with detailed endpoint information'
                        },
                        {
                            command: 'kubectl get endpoints -n core',
                            description: 'Shows service-to-pod endpoint mappings',
                            usage: 'Critical when services exist but cannot reach their backing pods'
                        },
                        {
                            command: 'kubectl describe service cdf-apiserver -n core',
                            description: 'Shows detailed configuration of the API server service'
                        }
                    ]
                },
                {
                    title: 'Network Connectivity Testing',
                    commands: [
                        {
                            command: 'kubectl exec -n core $(kubectl get pods -n core | grep cdf-apiserver | awk \'{print $1}\') -- nslookup itom-idm-svc',
                            description: 'Test DNS resolution within the cluster'
                        },
                        {
                            command: 'kubectl exec -n core $(kubectl get pods -n core | grep cdf-apiserver | awk \'{print $1}\') -- curl -I http://itom-idm-svc:18443',
                            description: 'Test HTTP connectivity between services'
                        }
                    ]
                },
                {
                    title: 'Service Recovery',
                    commands: [
                        {
                            command: 'kubectl delete svc -n core suite-conf-svc-arcsight-installer',
                            description: 'Delete problematic ArcSight suite configuration service',
                            usage: 'Specific fix for ArcSight configuration loading issues'
                        },
                        {
                            command: 'kubectl expose deployment cdf-apiserver --port=8080 --target-port=8080 -n core',
                            description: 'Recreate API server service if missing or corrupted'
                        }
                    ]
                }
            ]
        },
        {
            id: 'logs',
            title: '📋 Comprehensive Logging & Debugging',
            commandGroups: [
                {
                    title: 'Log Collection Strategies',
                    commands: [
                        {
                            command: 'kubectl logs -n core $(kubectl get pods -n core | grep cdf-apiserver | awk \'{print $1}\') --tail=100',
                            description: 'Show last 100 lines from API server logs'
                        },
                        {
                            command: 'kubectl logs -n core $(kubectl get pods -n core | grep cdf-apiserver | awk \'{print $1}\') --since=1h',
                            description: 'Show logs from the last hour only'
                        },
                        {
                            command: 'kubectl logs -n core $(kubectl get pods -n core | grep cdf-apiserver | awk \'{print $1}\') --previous',
                            description: 'Show logs from previous pod instance (before crash/restart)',
                            usage: 'Essential after pod crashes to see what caused the failure'
                        }
                    ]
                },
                {
                    title: 'Log Filtering & Analysis',
                    commands: [
                        {
                            command: 'kubectl logs -n core $(kubectl get pods -n core | grep cdf-apiserver | awk \'{print $1}\') | grep -i error',
                            description: 'Filter logs to show only error messages'
                        },
                        {
                            command: 'kubectl logs -n core $(kubectl get pods -n core | grep cdf-apiserver | awk \'{print $1}\') | grep -E "(WARN|ERROR|FATAL)"',
                            description: 'Show warning, error, and fatal log messages'
                        },
                        {
                            command: 'kubectl logs -n core $(kubectl get pods -n core | grep cdf-apiserver | awk \'{print $1}\') | grep -C 5 "Exception"',
                            description: 'Show exceptions with 5 lines of context before and after'
                        }
                    ]
                },
                {
                    title: 'Event Analysis',
                    commands: [
                        {
                            command: 'kubectl get events -n core --sort-by=.metadata.creationTimestamp',
                            description: 'Show all events in chronological order'
                        },
                        {
                            command: 'kubectl get events -n core --field-selector type=Warning',
                            description: 'Show only warning events'
                        },
                        {
                            command: 'kubectl get events -n core --field-selector reason=Failed',
                            description: 'Show events for failed operations'
                        }
                    ]
                }
            ]
        },
        {
            id: 'config',
            title: '⚙️ Configuration Management',
            commandGroups: [
                {
                    title: 'ConfigMap Operations',
                    commands: [
                        {
                            command: 'kubectl get configmaps -n core',
                            description: 'Shows all configuration maps'
                        },
                        {
                            command: 'kubectl describe configmap cdf -n core',
                            description: 'Shows main CDF configuration details'
                        },
                        {
                            command: 'kubectl get configmap suite-conf-cm-arcsight-installer -n core -o yaml',
                            description: 'Shows ArcSight suite configuration in YAML'
                        }
                    ]
                },
                {
                    title: 'Configuration Validation',
                    commands: [
                        {
                            command: 'kubectl get configmap cdf -n core -o jsonpath=\'{.data.EXTERNAL_ACCESS_HOST}\'',
                            description: 'Shows specific configuration value'
                        },
                        {
                            command: 'kubectl exec -n core $(kubectl get pods -n core | grep cdf-apiserver | awk \'{print $1}\') -- env | grep -E "(CDF|ARCSIGHT)"',
                            description: 'Shows environment variables in API server'
                        }
                    ]
                }
            ]
        },
        {
            id: 'database',
            title: '🗄️ Database Troubleshooting',
            commandGroups: [
                {
                    title: 'Database Service Status',
                    commands: [
                        {
                            command: 'kubectl get pods -n core | grep -E "(postgres|mysql|database|db)"',
                            description: 'Shows database-related pods'
                        },
                        {
                            command: 'kubectl get statefulsets -n core',
                            description: 'Shows database StatefulSets'
                        },
                        {
                            command: 'kubectl logs -n core $(kubectl get pods -n core | grep postgres | awk \'{print $1}\') --tail=100',
                            description: 'Shows database server logs'
                        }
                    ]
                },
                {
                    title: 'Database Connectivity',
                    commands: [
                        {
                            command: 'kubectl exec -n core $(kubectl get pods -n core | grep cdf-apiserver | awk \'{print $1}\') -- pg_isready -h postgres-service -p 5432',
                            description: 'Tests PostgreSQL connectivity'
                        },
                        {
                            command: 'kubectl exec -it $(kubectl get pods -n core | grep postgres | awk \'{print $1}\') -n core -- psql -U postgres -c \'\\l\'',
                            description: 'Shows database list'
                        }
                    ]
                }
            ]
        },
        {
            id: 'ui',
            title: '🖥️ UI & Frontend Troubleshooting',
            commandGroups: [
                {
                    title: 'Frontend Service Discovery',
                    commands: [
                        {
                            command: 'kubectl get pods -n core | grep -E "(frontend|ui|portal|web)"',
                            description: 'Shows frontend-related pods'
                        },
                        {
                            command: 'kubectl get svc -n core | grep -E "(frontend|ui|portal|web)"',
                            description: 'Shows frontend services'
                        },
                        {
                            command: 'kubectl logs -n core $(kubectl get pods -n core | grep ingress | awk \'{print $1}\') --tail=50',
                            description: 'Shows ingress controller logs'
                        }
                    ]
                },
                {
                    title: 'API Endpoint Testing',
                    commands: [
                        {
                            command: 'curl -k -I https://d1-spv-host05.domain.ent/',
                            description: 'Tests main page accessibility'
                        },
                        {
                            command: 'curl -k -I https://d1-spv-host05.domain.ent/urest/v1.1/config?updatedOn=DEPLOYED&hasValue=true',
                            description: 'Tests configuration API endpoint',
                            usage: 'Use when configuration pages are blank'
                        },
                        {
                            command: 'curl -k -I https://d1-spv-host05.domain.ent/static/',
                            description: 'Tests static resource accessibility'
                        }
                    ]
                },
                {
                    title: 'Frontend Service Recovery',
                    commands: [
                        {
                            command: 'kubectl rollout restart deployment -n core frontend-ingress-controller',
                            description: 'Restart frontend ingress'
                        },
                        {
                            command: 'kubectl rollout restart deployment -n core portal-ingress-controller',
                            description: 'Restart portal ingress'
                        }
                    ]
                }
            ]
        },
        {
            id: 'performance',
            title: '⚡ Performance & Resource Management',
            commandGroups: [
                {
                    title: 'Resource Utilization',
                    commands: [
                        {
                            command: 'kubectl top nodes --sort-by=cpu',
                            description: 'Shows node CPU usage (highest first)'
                        },
                        {
                            command: 'kubectl top pods -n core --sort-by=memory',
                            description: 'Shows pod memory usage (highest first)'
                        },
                        {
                            command: 'kubectl describe nodes | grep -A 5 "Allocated resources"',
                            description: 'Shows total resource allocation per node'
                        }
                    ]
                },
                {
                    title: 'Performance Bottlenecks',
                    commands: [
                        {
                            command: 'kubectl get events -n core --field-selector reason=OOMKilling',
                            description: 'Shows out of memory events'
                        },
                        {
                            command: 'kubectl get pods -n core --field-selector status.phase=Pending',
                            description: 'Shows pods waiting for resources'
                        },
                        {
                            command: 'kubectl describe nodes | grep -A 10 "Conditions:"',
                            description: 'Shows node pressure conditions'
                        }
                    ]
                }
            ]
        },
        {
            id: 'security',
            title: '🔒 Security & RBAC',
            commandGroups: [
                {
                    title: 'RBAC Analysis',
                    commands: [
                        {
                            command: 'kubectl get serviceaccounts -n core',
                            description: 'Shows all service accounts'
                        },
                        {
                            command: 'kubectl get rolebindings -n core -o wide',
                            description: 'Shows namespace role bindings'
                        },
                        {
                            command: 'kubectl get clusterrolebindings | grep cdf',
                            description: 'Shows cluster-wide CDF permissions'
                        }
                    ]
                },
                {
                    title: 'Security Validation',
                    commands: [
                        {
                            command: 'kubectl auth can-i get configmaps --namespace=core --as=system:serviceaccount:core:default',
                            description: 'Tests ConfigMap access permissions'
                        },
                        {
                            command: 'kubectl auth can-i create secrets --namespace=core --as=system:serviceaccount:core:cdf-apiserver',
                            description: 'Tests secret creation permissions'
                        }
                    ]
                }
            ]
        },
        {
            id: 'recovery',
            title: '🔧 Recovery & Disaster Recovery',
            commandGroups: [
                {
                    title: 'System Recovery',
                    commands: [
                        {
                            command: './kube-restart.sh',
                            description: 'Full ArcSight system restart script',
                            warning: 'Causes complete downtime'
                        },
                        {
                            command: 'kubectl delete pods --all -n core',
                            description: 'Restart all pods in core namespace',
                            warning: 'Causes service interruption'
                        },
                        {
                            command: 'watch -n 5 kubectl get pods -n core',
                            description: 'Monitor pod recovery status',
                            usage: 'Use during recovery operations'
                        }
                    ]
                },
                {
                    title: 'Data Recovery',
                    commands: [
                        {
                            command: 'kubectl get pv,pvc -n core',
                            description: 'Check persistent volume status'
                        },
                        {
                            command: 'kubectl exec -n core $(kubectl get pods -n core | grep postgres | awk \'{print $1}\') -- pg_dump -U postgres -d postgres > backup-$(date +%Y%m%d).sql',
                            description: 'Create database backup'
                        }
                    ]
                }
            ]
        },
        {
            id: 'patterns',
            title: '📚 Common Issue Patterns',
            patterns: [
                {
                    title: 'JWT Token Expired',
                    symptoms: '403 Forbidden errors, "JWT expired" in logs, blank pages after successful login, authentication timeouts',
                    solution: 'Clear browser cache and cookies → Restart cdf-apiserver pod → Delete suite-conf service → Test API directly with curl',
                    commands: [
                        {
                            type: 'multi',
                            command: `# JWT token issue resolution workflow
echo "Step 1: Check for JWT expiration"
kubectl logs -n core $(kubectl get pods -n core | grep cdf-apiserver | awk '{print $1}') | grep -i jwt | tail -10

echo "Step 2: Restart API server"
kubectl delete pod -n core $(kubectl get pods -n core | grep cdf-apiserver | awk '{print $1}')

echo "Step 3: Delete problematic service"
kubectl delete svc -n core suite-conf-svc-arcsight-installer

echo "Step 4: Test API directly"
curl -k -I https://d1-spv-host05.domain.ent/urest/v1.1/deployment`
                        }
                    ]
                },
                {
                    title: 'Pod CrashLoopBackOff',
                    symptoms: 'Pod repeatedly restarting, high restart count, service intermittently unavailable, application startup failures',
                    solution: 'Check previous pod logs → Examine resource limits → Verify persistent volume access → Review startup probes → Check dependencies',
                    commands: [
                        {
                            type: 'multi',
                            command: `# CrashLoopBackOff troubleshooting workflow
problem_pod=$(kubectl get pods -n core | grep CrashLoopBackOff | awk '{print $1}' | head -1)

if [ -n "$problem_pod" ]; then
  echo "Analyzing pod: $problem_pod"
  
  echo "=== Previous Pod Logs ==="
  kubectl logs -n core $problem_pod --previous
  
  echo "=== Pod Description ==="
  kubectl describe pod $problem_pod -n core
  
  echo "=== Related Events ==="
  kubectl get events -n core --field-selector involvedObject.name=$problem_pod
  
  echo "=== Restart Pod ==="
  kubectl delete pod $problem_pod -n core
else
  echo "No pods in CrashLoopBackOff state found"
fi`
                        }
                    ]
                },
                {
                    title: 'Configuration Not Loading',
                    symptoms: 'Blank configuration pages, 403 errors on config endpoints, settings not persisting, default values not loading',
                    solution: 'Verify ConfigMaps exist → Check RBAC permissions → Restart configuration services → Test config API endpoints → Clear browser cache',
                    commands: [
                        {
                            type: 'multi',
                            command: `# Configuration loading troubleshooting
echo "=== Checking ConfigMaps ==="
kubectl get configmaps -n core | grep -E "(suite-conf|cdf)"

echo "=== Testing RBAC Permissions ==="
kubectl auth can-i get configmaps --namespace=core --as=system:serviceaccount:core:default

echo "=== Testing Config API ==="
curl -k -I https://d1-spv-host05.domain.ent/urest/v1.1/config?updatedOn=DEPLOYED&hasValue=true

echo "=== Restarting Config Services ==="
kubectl rollout restart deployment -n core $(kubectl get deploy -n core | grep config | awk '{print $1}')

echo "=== Verifying ConfigMap Content ==="
kubectl describe configmap cdf -n core | head -20`
                        }
                    ]
                },
                {
                    title: 'Database Connection Issues',
                    symptoms: 'API calls timeout, data not persisting, Hibernate connection errors, database unavailable messages, slow queries',
                    solution: 'Check database pod status → Verify service endpoints → Test connectivity → Check connection pool settings → Monitor resource usage',
                    commands: [
                        {
                            type: 'multi',
                            command: `# Database connectivity troubleshooting
echo "=== Database Pod Status ==="
kubectl get pods -n core | grep postgres

echo "=== Database Service Status ==="
kubectl get svc -n core | grep postgres

echo "=== Database Logs ==="
kubectl logs -n core $(kubectl get pods -n core | grep postgres | awk '{print $1}') --tail=50

echo "=== Testing Connectivity ==="
kubectl exec -n core $(kubectl get pods -n core | grep cdf-apiserver | awk '{print $1}') -- pg_isready -h postgres-service -p 5432`
                        }
                    ]
                },
                {
                    title: 'UI Blank Pages',
                    symptoms: 'User interface loads but shows no content, configuration pages are empty, static assets not loading, JavaScript errors in console',
                    solution: 'Check frontend pods → Test API endpoints directly → Restart ingress controllers → Verify static assets → Check browser console for errors',
                    commands: [
                        {
                            type: 'multi',
                            command: `# UI blank page troubleshooting workflow
echo "=== Frontend Pod Status ==="
kubectl get pods -n core | grep -E "(frontend|ui|portal|ingress)"

echo "=== Testing API Endpoints ==="
curl -k -I https://d1-spv-host05.domain.ent/urest/v1.1/deployment
curl -k -I https://d1-spv-host05.domain.ent/static/

echo "=== Restarting Ingress Controllers ==="
kubectl rollout restart deployment -n core frontend-ingress-controller
kubectl rollout restart deployment -n core portal-ingress-controller

echo "=== Checking Ingress Logs ==="
kubectl logs -n core $(kubectl get pods -n core | grep ingress | awk '{print $1}') | grep ERROR | tail -10`
                        }
                    ]
                },
                {
                    title: 'Resource Exhaustion',
                    symptoms: 'Pods stuck in Pending state, OOMKilled events, node pressure warnings, significantly slower performance, scheduling failures',
                    solution: 'Check node resources → Identify resource-heavy pods → Scale down non-essential services → Review resource limits → Consider adding nodes',
                    commands: [
                        {
                            type: 'multi',
                            command: `# Resource exhaustion analysis and mitigation
echo "=== Node Resource Status ==="
kubectl top nodes

echo "=== Top Resource Consumers ==="
kubectl top pods -n core --sort-by=memory | head -10

echo "=== OOM Events ==="
kubectl get events -n core --field-selector reason=OOMKilling

echo "=== Node Conditions ==="
kubectl describe nodes | grep -A 10 "Conditions:"

echo "=== Pending Pods ==="
kubectl get pods -n core --field-selector status.phase=Pending`
                        }
                    ]
                }
            ]
        }
    ];
}
                    