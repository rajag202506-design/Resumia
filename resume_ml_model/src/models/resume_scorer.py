import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.svm import SVR
from sklearn.preprocessing import StandardScaler, RobustScaler
from sklearn.model_selection import cross_val_score, GridSearchCV
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.pipeline import Pipeline
import joblib
import logging
from typing import Dict, List, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ResumeScorer:
    """
    Machine Learning model for scoring resume quality
    """
    
    def __init__(self, model_type: str = 'ensemble'):
        """
        Initialize the resume scorer
        
        Args:
            model_type: Type of model to use ('rf', 'gbm', 'ensemble', 'linear')
        """
        self.model_type = model_type
        self.model = None
        self.scaler = None
        self.feature_names = []
        self.is_trained = False
        
        # Model configurations
        self.model_configs = {
            'rf': {
                'model': RandomForestRegressor(),
                'params': {
                    'model__n_estimators': [100, 200, 300],
                    'model__max_depth': [10, 20, None],
                    'model__min_samples_split': [2, 5, 10],
                    'model__min_samples_leaf': [1, 2, 4]
                }
            },
            'gbm': {
                'model': GradientBoostingRegressor(),
                'params': {
                    'model__n_estimators': [100, 200],
                    'model__learning_rate': [0.05, 0.1, 0.15],
                    'model__max_depth': [3, 5, 7],
                    'model__min_samples_split': [2, 5],
                    'model__min_samples_leaf': [1, 2]
                }
            },
            'linear': {
                'model': Ridge(),
                'params': {
                    'model__alpha': [0.1, 1.0, 10.0, 100.0]
                }
            }
        }
    
    def prepare_features(self, X: pd.DataFrame) -> np.ndarray:
        """Prepare features for training/prediction"""
        
        # Handle missing values
        X_processed = X.fillna(0)
        
        # Convert boolean columns to int
        bool_columns = X_processed.select_dtypes(include=['bool']).columns
        X_processed[bool_columns] = X_processed[bool_columns].astype(int)
        
        # Store feature names if not already stored
        if not self.feature_names:
            self.feature_names = list(X_processed.columns)
        
        # Ensure feature consistency
        if set(X_processed.columns) != set(self.feature_names):
            logger.warning("Feature mismatch detected. Reordering features...")
            X_processed = X_processed.reindex(columns=self.feature_names, fill_value=0)
        
        return X_processed.values
    
    def create_ensemble_model(self) -> Pipeline:
        """Create ensemble model combining multiple algorithms"""
        
        from sklearn.ensemble import VotingRegressor
        
        # Individual models
        rf = RandomForestRegressor(n_estimators=200, max_depth=20, random_state=42)
        gbm = GradientBoostingRegressor(n_estimators=150, learning_rate=0.1, max_depth=5, random_state=42)
        ridge = Ridge(alpha=10.0)
        
        # Ensemble
        ensemble = VotingRegressor([
            ('rf', rf),
            ('gbm', gbm),
            ('ridge', ridge)
        ])
        
        # Create pipeline with scaling
        pipeline = Pipeline([
            ('scaler', StandardScaler()),
            ('model', ensemble)
        ])
        
        return pipeline
    
    def train(self, X: pd.DataFrame, y: pd.Series, validation_split: float = 0.2) -> Dict:
        """
        Train the resume scoring model
        
        Args:
            X: Feature matrix
            y: Target scores (0-100)
            validation_split: Fraction of data for validation
            
        Returns:
            Training results dictionary
        """
        logger.info(f"Training resume scorer with {len(X)} samples...")
        
        # Prepare features
        X_processed = self.prepare_features(X)
        
        # Split data for validation
        from sklearn.model_selection import train_test_split
        X_train, X_val, y_train, y_val = train_test_split(
            X_processed, y, test_size=validation_split, random_state=42
        )
        
        # Create model based on type
        if self.model_type == 'ensemble':
            self.model = self.create_ensemble_model()
        else:
            config = self.model_configs[self.model_type]
            self.model = Pipeline([
                ('scaler', StandardScaler()),
                ('model', config['model'])
            ])
        
        # Train the model
        logger.info(f"Training {self.model_type} model...")
        self.model.fit(X_train, y_train)
        
        # Validate the model
        train_pred = self.model.predict(X_train)
        val_pred = self.model.predict(X_val)
        
        # Calculate metrics
        results = {
            'train_mse': mean_squared_error(y_train, train_pred),
            'train_mae': mean_absolute_error(y_train, train_pred),
            'train_r2': r2_score(y_train, train_pred),
            'val_mse': mean_squared_error(y_val, val_pred),
            'val_mae': mean_absolute_error(y_val, val_pred),
            'val_r2': r2_score(y_val, val_pred),
            'train_samples': len(X_train),
            'val_samples': len(X_val)
        }
        
        # Cross-validation scores
        cv_scores = cross_val_score(self.model, X_processed, y, cv=5, scoring='r2')
        results['cv_mean'] = cv_scores.mean()
        results['cv_std'] = cv_scores.std()
        
        self.is_trained = True
        
        logger.info(f"Training completed. Validation R²: {results['val_r2']:.3f}")
        logger.info(f"Cross-validation R²: {results['cv_mean']:.3f} ± {results['cv_std']:.3f}")
        
        return results
    
    def hyperparameter_tuning(self, X: pd.DataFrame, y: pd.Series) -> Dict:
        """
        Perform hyperparameter tuning using GridSearchCV
        
        Args:
            X: Feature matrix
            y: Target scores
            
        Returns:
            Best parameters and scores
        """
        if self.model_type == 'ensemble':
            logger.info("Hyperparameter tuning not available for ensemble model")
            return {}
        
        logger.info(f"Performing hyperparameter tuning for {self.model_type}...")
        
        X_processed = self.prepare_features(X)
        config = self.model_configs[self.model_type]
        
        # Create pipeline
        pipeline = Pipeline([
            ('scaler', StandardScaler()),
            ('model', config['model'])
        ])
        
        # Grid search
        grid_search = GridSearchCV(
            pipeline,
            config['params'],
            cv=5,
            scoring='r2',
            n_jobs=-1,
            verbose=1
        )
        
        grid_search.fit(X_processed, y)
        
        # Update model with best parameters
        self.model = grid_search.best_estimator_
        self.is_trained = True
        
        results = {
            'best_params': grid_search.best_params_,
            'best_score': grid_search.best_score_,
            'cv_results': grid_search.cv_results_
        }
        
        logger.info(f"Best parameters: {results['best_params']}")
        logger.info(f"Best CV score: {results['best_score']:.3f}")
        
        return results
    
    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """
        Predict resume scores
        
        Args:
            X: Feature matrix
            
        Returns:
            Predicted scores (0-100)
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
        
        X_processed = self.prepare_features(X)
        predictions = self.model.predict(X_processed)
        
        # Ensure predictions are within valid range (0-100)
        predictions = np.clip(predictions, 0, 100)
        
        return predictions
    
    def predict_with_confidence(self, X: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """
        Predict scores with confidence intervals (for ensemble models)
        
        Args:
            X: Feature matrix
            
        Returns:
            Tuple of (predictions, confidence_intervals)
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
        
        predictions = self.predict(X)
        
        # For ensemble models, we can estimate confidence from individual predictors
        if self.model_type == 'ensemble':
            X_processed = self.prepare_features(X)
            X_scaled = self.model.named_steps['scaler'].transform(X_processed)
            
            # Get predictions from individual models
            individual_preds = []
            for name, estimator in self.model.named_steps['model'].estimators_:
                pred = estimator.predict(X_scaled)
                individual_preds.append(pred)
            
            # Calculate standard deviation as confidence measure
            confidence = np.std(individual_preds, axis=0)
        else:
            # For non-ensemble models, use a fixed confidence based on validation error
            confidence = np.full(len(predictions), 5.0)  # Default confidence interval
        
        return predictions, confidence
    
    def get_feature_importance(self) -> pd.DataFrame:
        """
        Get feature importance from the trained model
        
        Returns:
            DataFrame with features and their importance scores
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before getting feature importance")
        
        # Get the actual model (after scaler in pipeline)
        if hasattr(self.model, 'named_steps'):
            actual_model = self.model.named_steps['model']
        else:
            actual_model = self.model
        
        # Extract feature importance based on model type
        if hasattr(actual_model, 'feature_importances_'):
            # Tree-based models
            importance = actual_model.feature_importances_
        elif hasattr(actual_model, 'coef_'):
            # Linear models
            importance = np.abs(actual_model.coef_)
        elif hasattr(actual_model, 'estimators_'):
            # Ensemble models
            importance_list = []
            for name, estimator in actual_model.estimators_:
                if hasattr(estimator, 'feature_importances_'):
                    importance_list.append(estimator.feature_importances_)
                elif hasattr(estimator, 'coef_'):
                    importance_list.append(np.abs(estimator.coef_))
            
            if importance_list:
                importance = np.mean(importance_list, axis=0)
            else:
                importance = np.zeros(len(self.feature_names))
        else:
            importance = np.zeros(len(self.feature_names))
        
        # Create DataFrame
        importance_df = pd.DataFrame({
            'feature': self.feature_names,
            'importance': importance
        })
        
        # Sort by importance
        importance_df = importance_df.sort_values('importance', ascending=False)
        
        return importance_df
    
    def save_model(self, filepath: str):
        """Save the trained model"""
        if not self.is_trained:
            raise ValueError("Model must be trained before saving")
        
        model_data = {
            'model': self.model,
            'model_type': self.model_type,
            'feature_names': self.feature_names,
            'is_trained': self.is_trained
        }
        
        joblib.dump(model_data, filepath)
        logger.info(f"Model saved to {filepath}")
    
    def load_model(self, filepath: str):
        """Load a trained model"""
        model_data = joblib.load(filepath)
        
        self.model = model_data['model']
        self.model_type = model_data['model_type']
        self.feature_names = model_data['feature_names']
        self.is_trained = model_data['is_trained']
        
        logger.info(f"Model loaded from {filepath}")
    
    def evaluate_model(self, X: pd.DataFrame, y: pd.Series) -> Dict:
        """
        Evaluate model performance on test data
        
        Args:
            X: Test features
            y: True scores
            
        Returns:
            Evaluation metrics
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before evaluation")
        
        predictions = self.predict(X)
        
        metrics = {
            'mse': mean_squared_error(y, predictions),
            'mae': mean_absolute_error(y, predictions),
            'r2': r2_score(y, predictions),
            'rmse': np.sqrt(mean_squared_error(y, predictions))
        }
        
        # Score distribution analysis
        score_diff = predictions - y
        metrics.update({
            'mean_error': np.mean(score_diff),
            'std_error': np.std(score_diff),
            'max_overestimate': np.max(score_diff),
            'max_underestimate': np.min(score_diff)
        })
        
        return metrics

if __name__ == "__main__":
    # Example usage
    scorer = ResumeScorer(model_type='ensemble')
    
    # Create sample data
    np.random.seed(42)
    n_samples = 1000
    n_features = 50
    
    X = pd.DataFrame(np.random.randn(n_samples, n_features), 
                    columns=[f'feature_{i}' for i in range(n_features)])
    y = pd.Series(np.random.randint(20, 95, n_samples))
    
    # Train the model
    results = scorer.train(X, y)
    print("Training results:", results)
    
    # Make predictions
    predictions = scorer.predict(X[:10])
    print("Sample predictions:", predictions)
    
    # Get feature importance
    importance = scorer.get_feature_importance()
    print("Top 10 important features:")
    print(importance.head(10)) 