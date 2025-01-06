const ServiceTypes = {
  VERTEX_AI: 'vertex-ai',
  OPENAI: 'openai',
  JENKINS: 'jenkins',
  GKE: 'gke',
  BORG: 'borg'
};

const ResourceDefaults = {
  [ServiceTypes.VERTEX_AI]: {
    cpu: '1',
    memory: '2Gi',
    storage: '5Gi',
    pods: 2
  },
  [ServiceTypes.OPENAI]: {
    cpu: '0.5',
    memory: '1Gi',
    storage: '1Gi',
    pods: 1
  },
  [ServiceTypes.JENKINS]: {
    cpu: '2',
    memory: '4Gi',
    storage: '10Gi',
    pods: 1
  },
  [ServiceTypes.GKE]: {
    cpu: '2',
    memory: '4Gi',
    storage: '20Gi',
    pods: 3
  },
  [ServiceTypes.BORG]: {
    cpu: '2',
    memory: '4Gi',
    storage: '20Gi',
    pods: 3
  }
};

const ResourceLimits = {
  [ServiceTypes.VERTEX_AI]: {
    cpu: '4',
    memory: '8Gi',
    storage: '20Gi',
    pods: 5
  },
  [ServiceTypes.OPENAI]: {
    cpu: '2',
    memory: '4Gi',
    storage: '5Gi',
    pods: 3
  },
  [ServiceTypes.JENKINS]: {
    cpu: '4',
    memory: '8Gi',
    storage: '50Gi',
    pods: 2
  },
  [ServiceTypes.GKE]: {
    cpu: '8',
    memory: '16Gi',
    storage: '100Gi',
    pods: 10
  },
  [ServiceTypes.BORG]: {
    cpu: '8',
    memory: '16Gi',
    storage: '100Gi',
    pods: 10
  }
};

module.exports = {
  ServiceTypes,
  ResourceDefaults,
  ResourceLimits
};